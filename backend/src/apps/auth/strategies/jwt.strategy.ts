import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import { AuthenticatedUser } from '@/common/interfaces/authenticated-user.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        private configService: ConfigService,
        @InjectModel(User)
        private userModel: typeof User,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('JWT_SECRET') || 'default_secret_key', // Fallback for dev
        });
    }

    async validate(payload: any): Promise<AuthenticatedUser> {
        const user = await this.userModel.findByPk(payload.sub);
        if (!user || !user.isActive) {
            throw new UnauthorizedException();
        }
        return {
            id: user.id,
            email: user.email,
            name: user.name,
            tenantId: user.tenantId || payload.tenantId || 'default',
            isActive: user.isActive,
            isSystemAdmin:
                !!payload.isSystemAdmin ||
                String(user.email || '').toLowerCase() === 'admin@example.com' ||
                String(user.email || '').toLowerCase().startsWith('admin@') ||
                String(user.name || '').toLowerCase().includes('admin'),
        };
    }
}
