import { Body, Controller, Get, Param, Post, Request, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'admin@example.com' },
                password: { type: 'string', example: 'admin123' },
            },
        },
    })
    async login(@Body() req: { email?: string; password?: string }) {
        if (!req.email || !req.password) {
            throw new UnauthorizedException('Email and password are required');
        }

        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            throw new UnauthorizedException('Credenciais invalidas');
        }

        return this.authService.login(user);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register new user (pending approval)' })
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
    async register(@Body() req: { name?: string; email?: string; password?: string }) {
        if (!req.name || !req.email || !req.password) {
            throw new UnauthorizedException('Name, email and password are required');
        }
        return this.authService.register(req.name, req.email, req.password);
    }

    @Post('forgot-password')
    @ApiOperation({ summary: 'Send reset password link by email' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                email: { type: 'string', example: 'usuario@empresa.com' },
            },
        },
    })
    async forgotPassword(@Body() req: { email?: string }) {
        if (!req.email) {
            throw new UnauthorizedException('Email is required');
        }
        return this.authService.requestPasswordReset(req.email);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Reset password using token sent by email' })
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
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    getProfile(@Request() req: any) {
        return req.user;
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('users')
    @ApiOperation({ summary: 'List users with approval and permissions' })
    async getUsers() {
        return this.authService.listUsersWithPermissions();
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('users/:id/approve')
    @ApiOperation({ summary: 'Approve and activate user' })
    async approveUser(@Param('id') id: string) {
        return this.authService.setUserActive(id, true);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('users/:id/revoke')
    @ApiOperation({ summary: 'Revoke user access' })
    async revokeUser(@Param('id') id: string) {
        return this.authService.setUserActive(id, false);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('users/:id/permissions')
    @ApiOperation({ summary: 'Set user permissions by module/action' })
    async setUserPermissions(@Param('id') id: string, @Body() body: { permissions: Record<string, any> }) {
        return this.authService.setUserPermissions(id, body?.permissions || {});
    }
}