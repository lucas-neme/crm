import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import * as nodeCrypto from 'crypto';
import { Op } from 'sequelize';

import { Configuracao } from '../../configuracoes/models/configuracao.model';

type ResetTokenEntry = {
    email: string;
    expiresAt: number;
};

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Configuracao)
        private readonly configuracaoModel: typeof Configuracao,
        private jwtService: JwtService,
    ) { }

    async validateUser(identifier: string, pass: string): Promise<any> {
        const normalized = (identifier || '').trim().toLowerCase();
        const lookup = normalized === 'admin' ? 'admin@example.com' : normalized;

        const user = await this.userModel.findOne({
            where: {
                [Op.or]: [
                    { email: lookup },
                    { name: identifier.trim() },
                ],
            },
        });
        if (!user) return null;

        if (!user.isActive) {
            throw new UnauthorizedException('Usuario aguardando aprovacao do administrador');
        }

        if (await user.validatePassword(pass)) {
            const { passwordHash, ...result } = user.toJSON();
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        };
    }

    async seedAdminUser() {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash('admin123', salt);

        const existingAdmin = await this.userModel.findOne({ where: { email: 'admin@example.com' } });
        if (!existingAdmin) {
            await this.userModel.create({
                email: 'admin@example.com',
                name: 'Admin',
                passwordHash,
                isActive: true,
            });
            console.log('Admin user created: admin@example.com / admin123');
            return;
        }

        existingAdmin.name = 'Admin';
        existingAdmin.passwordHash = passwordHash;
        existingAdmin.isActive = true;
        await existingAdmin.save();
        console.log('Admin user ensured: admin@example.com / admin123');
    }

    async register(name: string, email: string, password: string) {
        const existing = await this.userModel.findOne({ where: { email } });
        if (existing) {
            return { message: 'Email ja cadastrado' };
        }

        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await this.userModel.create({
            name,
            email,
            passwordHash,
            isActive: false,
        });

        return {
            message: 'Usuario criado com sucesso e aguardando aprovacao do administrador',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
            },
        };
    }

    async requestPasswordReset(email: string) {
        const genericMessage = 'Se o email existir, voce recebera o link para redefinir a senha';
        const user = await this.userModel.findOne({ where: { email } });
        if (!user) return { message: genericMessage };

        const token = nodeCrypto.randomUUID();
        const expiresAt = Date.now() + 30 * 60 * 1000;

        const tokenMap = await this.getPasswordResetTokens();
        tokenMap[token] = { email: user.email, expiresAt };
        await this.setPasswordResetTokens(tokenMap);

        const frontendBaseUrl = (process.env.FRONTEND_URL || 'https://crm.wampa.com.br').replace(/\/$/, '');
        const resetLink = `${frontendBaseUrl}/login?mode=reset&token=${token}`;
        await this.sendPasswordResetEmail(user.email, user.name, resetLink);

        return { message: genericMessage };
    }

    async resetPassword(token: string, password: string) {
        const tokenMap = await this.getPasswordResetTokens();
        const tokenEntry = tokenMap[token];

        if (!tokenEntry || tokenEntry.expiresAt < Date.now()) {
            throw new UnauthorizedException('Token invalido ou expirado');
        }

        const user = await this.userModel.findOne({ where: { email: tokenEntry.email } });
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }

        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(password, salt);
        await user.save();

        delete tokenMap[token];
        await this.setPasswordResetTokens(tokenMap);

        return { message: 'Senha redefinida com sucesso' };
    }

    async listUsersWithPermissions() {
        const users = await this.userModel.findAll({
            attributes: ['id', 'name', 'email', 'isActive', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
        });

        const permissionsMap = await this.getPermissionsMap();

        return users.map((user) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            isActive: user.isActive,
            approved: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            permissions: permissionsMap[user.id] || this.getDefaultPermissions(),
        }));
    }

    async setUserActive(userId: string, isActive: boolean) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }

        user.isActive = isActive;
        await user.save();
        return {
            id: user.id,
            isActive: user.isActive,
            approved: user.isActive,
        };
    }

    async setUserPermissions(userId: string, permissions: Record<string, any>) {
        const user = await this.userModel.findByPk(userId);
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }

        const permissionsMap = await this.getPermissionsMap();
        permissionsMap[userId] = { ...this.getDefaultPermissions(), ...permissions };
        await this.setPermissionsMap(permissionsMap);

        return {
            id: userId,
            permissions: permissionsMap[userId],
        };
    }

    private getDefaultPermissions() {
        return {
            clientes: { read: true, create: false, update: false, delete: false },
            leads: { read: true, create: false, update: false, delete: false },
            produtos: { read: true, create: false, update: false, delete: false },
            negocios: { read: true, create: false, update: false, delete: false },
            financeiro: { read: false, create: false, update: false, delete: false },
            configuracoes: { read: false, create: false, update: false, delete: false },
            imoveis: { read: true, create: false, update: false, delete: false },
            reservas: { read: true, create: false, update: false, delete: false },
        };
    }

    private async getPermissionsMap(): Promise<Record<string, any>> {
        const config = await this.configuracaoModel.findByPk('user_permissions_map');
        if (!config?.valor) return {};
        try {
            const parsed = JSON.parse(config.valor);
            return typeof parsed === 'object' && parsed ? parsed : {};
        } catch {
            return {};
        }
    }

    private async setPermissionsMap(map: Record<string, any>) {
        await this.configuracaoModel.upsert({
            chave: 'user_permissions_map',
            valor: JSON.stringify(map),
        });
    }

    private async getPasswordResetTokens(): Promise<Record<string, ResetTokenEntry>> {
        const config = await this.configuracaoModel.findByPk('password_reset_tokens');
        if (!config?.valor) return {};
        try {
            const parsed = JSON.parse(config.valor);
            return typeof parsed === 'object' && parsed ? parsed : {};
        } catch {
            return {};
        }
    }

    private async setPasswordResetTokens(map: Record<string, ResetTokenEntry>) {
        await this.configuracaoModel.upsert({
            chave: 'password_reset_tokens',
            valor: JSON.stringify(map),
        });
    }

    async sendPasswordResetEmail(email: string, name: string, resetLink: string) {
        console.log(`[PASSWORD_RESET_LINK_SIMULATED] ${email} => ${resetLink}`);
        // Nodemailer disabled temporarily
    }
}
