import { Controller, Request, Post, UseGuards, Get, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from '../services/auth.service';
import { ApiTags, ApiOperation, ApiBody } from '@nestjs/swagger';

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
    async login(@Body() req) {
        if (!req.email || !req.password) {
            return { message: 'Email and password are required' };
        }
        const user = await this.authService.validateUser(req.email, req.password);
        if (!user) {
            return { message: 'Valid credentials are required' };
        }
        return this.authService.login(user);
    }

    @Post('register')
    @ApiOperation({ summary: 'Register new user (pending approval)' })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'Novo Usuário' },
                email: { type: 'string', example: 'usuario@empresa.com' },
                password: { type: 'string', example: 'senha123' },
            },
        },
    })
    async register(@Body() req) {
        if (!req.name || !req.email || !req.password) {
            return { message: 'Name, email and password are required' };
        }
        return this.authService.register(req.name, req.email, req.password);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('profile')
    @ApiOperation({ summary: 'Get current user profile' })
    getProfile(@Request() req) {
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
    async approveUser(@Request() req) {
        return this.authService.setUserActive(req.params.id, true);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('users/:id/revoke')
    @ApiOperation({ summary: 'Revoke user access' })
    async revokeUser(@Request() req) {
        return this.authService.setUserActive(req.params.id, false);
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('users/:id/permissions')
    @ApiOperation({ summary: 'Set user permissions by module/action' })
    async setUserPermissions(@Request() req, @Body() body: { permissions: Record<string, any> }) {
        return this.authService.setUserPermissions(req.params.id, body?.permissions || {});
    }
}
