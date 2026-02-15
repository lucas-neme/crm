import { Body, Controller, ForbiddenException, Get, Headers, Param, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('autenticação')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    private resolveTenantId(tenantHeader?: string): string {
        const value = (tenantHeader || '').trim();
        return value || 'default';
    }

    private ensureSystemAdmin(req: any) {
        const isSystemAdmin = !!req?.user?.isSystemAdmin;
        const email = String(req?.user?.email || '').toLowerCase();
        const name = String(req?.user?.name || '').toLowerCase();
        const hasAdminIdentity = email === 'admin@example.com' || email.startsWith('admin@') || name.includes('admin');
        if (!isSystemAdmin && !hasAdminIdentity) {
            throw new ForbiddenException('Apenas o administrador pode realizar esta operacao');
        }
    }

    @Post('login')
    @ApiOperation({ summary: 'Login com usuário/e-mail e senha' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'admin ou admin@example.com' },
                password: { type: 'string', example: 'admin123' },
            },
        },
    })
    async login(@Headers('x-tenant-id') tenantHeader: string, @Body() req: { email?: string; password?: string }) {
        if (!req.email || !req.password) {
            throw new UnauthorizedException('Email and password are required');
        }

        const tenantId = this.resolveTenantId(tenantHeader);
        const user = await this.authService.validateUser(req.email, req.password, tenantId);
        if (!user) {
            throw new UnauthorizedException('Credenciais invalidas');
        }

        return this.authService.login(user);
    }

    @Post('register')
    @ApiOperation({ summary: 'Cadastrar novo usuário (pendente de aprovação)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Novo Usuario' },
                email: { type: 'string', example: 'usuario@empresa.com' },
                password: { type: 'string', example: 'senha123' },
            },
        },
    })
    async register(@Headers('x-tenant-id') tenantHeader: string, @Body() req: { name?: string; email?: string; password?: string }) {
        if (!req.name || !req.email || !req.password) {
            throw new UnauthorizedException('Name, email and password are required');
        }
        return this.authService.register(req.name, req.email, req.password, this.resolveTenantId(tenantHeader));
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Enviar link de redefinição de senha por e-mail' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'usuario@empresa.com' },
            },
        },
    })
    async forgotPassword(@Headers('x-tenant-id') tenantHeader: string, @Body() req: { email?: string }) {
        if (!req.email) {
            throw new UnauthorizedException('Email is required');
        }
        return this.authService.requestPasswordReset(req.email, this.resolveTenantId(tenantHeader));
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Redefinir senha usando token enviado por e-mail' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                token: { type: 'string', example: 'uuid-token' },
                password: { type: 'string', example: 'novaSenha123' },
            },
        },
    })
    async resetPassword(@Body() req: { token?: string; password?: string }) {
        if (!req.token || !req.password) {
            throw new UnauthorizedException('Token and password are required');
        }
        return this.authService.resetPassword(req.token, req.password);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('profile')
    @ApiOperation({ summary: 'Obter perfil do usuário atual' })
    getProfile(@Request() req: any) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Get('users')
    @ApiOperation({ summary: 'Listar usuários com aprovação e permissões' })
    async getUsers(@Request() req: any) {
        this.ensureSystemAdmin(req);
        return this.authService.listUsersWithPermissions(req.user?.tenantId || 'default');
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('users/:id/approve')
    @ApiOperation({ summary: 'Aprovar e ativar usuário' })
    async approveUser(@Request() req: any, @Param('id') id: string) {
        this.ensureSystemAdmin(req);
        return this.authService.setUserActive(req.user?.tenantId || 'default', id, true);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('users/:id/revoke')
    @ApiOperation({ summary: 'Revogar acesso do usuário' })
    async revokeUser(@Request() req: any, @Param('id') id: string) {
        this.ensureSystemAdmin(req);
        return this.authService.setUserActive(req.user?.tenantId || 'default', id, false);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('users/:id/permissions')
    @ApiOperation({ summary: 'Definir permissões do usuário por módulo/ação' })
    async setUserPermissions(@Request() req: any, @Param('id') id: string, @Body() body: { permissions: Record<string, any> }) {
        this.ensureSystemAdmin(req);
        return this.authService.setUserPermissions(req.user?.tenantId || 'default', id, body?.permissions || {});
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('users/:id/profile')
    @ApiOperation({ summary: 'Atualizar dados do perfil do usuário' })
    async setUserProfile(
        @Request() req: any,
        @Param('id') id: string,
        @Body() body: { name?: string; email?: string; phone?: string; birthDate?: string },
    ) {
        return this.authService.setUserProfile(req.user?.tenantId || 'default', id, body || {});
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth()
    @Post('users/:id/change-password')
    @ApiOperation({ summary: 'Alterar senha do usuário' })
    async setUserPassword(@Request() req: any, @Param('id') id: string, @Body() body: { password?: string }) {
        return this.authService.setUserPassword(req.user?.tenantId || 'default', id, body?.password || '');
    }
}
