import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import * as nodeCrypto from 'crypto';
import { Op } from 'sequelize';

import { Configuracao } from '../../configuracoes/models/configuracao.model';

type ResetTokenEntry = {
    email: string;
    tenantId: string;
    expiresAt: number;
};

type UserProfileEntry = {
    phone?: string;
    birthDate?: string;
};

@Injectable()
export class AuthService {
    private ensuredConfiguracoesText = false;

    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Configuracao)
        private readonly configuracaoModel: typeof Configuracao,
        private jwtService: JwtService,
    ) { }

    async validateUser(identifier: string, pass: string, tenantId: string): Promise<any> {
        const normalized = (identifier || '').trim().toLowerCase();
        const lookup = normalized === 'admin' ? 'admin@example.com' : normalized;

        const user = await this.userModel.findOne({
            where: {
                tenantId,
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
        const permissionsMap = await this.getPermissionsMap();
        const configPerms = permissionsMap?.[user.id]?.configuracoes || {};
        const isSystemAdmin =
            this.isAdminIdentity(user.email, user.name) ||
            !!configPerms.update ||
            (!!configPerms.read && !!configPerms.create && !!configPerms.delete);
        const payload = { email: user.email, sub: user.id, tenantId: user.tenantId || 'default', isSystemAdmin };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                tenantId: user.tenantId || 'default',
                isSystemAdmin,
            }
        };
    }

    async seedAdminUser() {
        const salt = await bcrypt.genSalt();
        const adminEmail = 'admin@example.com';
        const nemerEmail = 'nemer.vendas@gmail.com';

        // Helper to ensure user
        const ensureUser = async (email: string, name: string, passwordHash: string) => {
            let user = await this.userModel.findOne({ where: { email } });
            if (!user) {
                user = await this.userModel.create({ email, name, passwordHash, isActive: true, tenantId: 'default' });
                console.log(`User created: ${email}`);
            } else {
                user.name = name;
                user.passwordHash = passwordHash;
                user.isActive = true;
                user.tenantId = user.tenantId || 'default';
                await user.save();
                console.log(`User updated: ${email}`);
            }
            return user;
        };

        const adminHash = await bcrypt.hash('admin123', salt);
        const admin = await ensureUser(adminEmail, 'Admin', adminHash);

        const nemerHash = await bcrypt.hash('sorte58', salt);
        const nemer = await ensureUser(nemerEmail, 'Nemer Vendas', nemerHash);

        // Grant full permissions
        const permissionsMap = await this.getPermissionsMap();
        const fullPerms = this.getFullPermissions();
        
        permissionsMap[admin.id] = fullPerms;
        permissionsMap[nemer.id] = fullPerms;
        
        try {
            await this.setPermissionsMap(permissionsMap);
            console.log('Permissions updated for Admin and Nemer Vendas');
        } catch (error: any) {
            const code = error?.original?.code || error?.parent?.code || error?.code;
            if (code === '22001') {
                console.warn(
                    'Skipping permissions seed: configuracoes.valor is too short (varchar). ' +
                    'Run SQL migration to TEXT to persist permissions map.'
                );
            } else {
                throw error;
            }
        }
    }

    async register(name: string, email: string, password: string, tenantId: string) {
        const existing = await this.userModel.findOne({ where: { email, tenantId } });
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
            tenantId,
        });

        return {
            message: 'Usuario criado com sucesso e aguardando aprovacao do administrador',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                tenantId: user.tenantId,
                isActive: user.isActive,
            },
        };
    }

    async requestPasswordReset(email: string, tenantId: string) {
        const genericMessage = 'Se o email existir, voce recebera o link para redefinir a senha';
        const user = await this.userModel.findOne({ where: { email, tenantId } });
        if (!user) return { message: genericMessage };

        const token = nodeCrypto.randomUUID();
        const expiresAt = Date.now() + 30 * 60 * 1000;

        const tokenMap = await this.getPasswordResetTokens();
        tokenMap[token] = { email: user.email, tenantId: user.tenantId || tenantId, expiresAt };
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

        const user = await this.userModel.findOne({ where: { email: tokenEntry.email, tenantId: tokenEntry.tenantId } });
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

    async listUsersWithPermissions(tenantId: string) {
        const users = await this.userModel.findAll({
            where: { tenantId },
            attributes: ['id', 'name', 'email', 'isActive', 'createdAt', 'updatedAt'],
            order: [['createdAt', 'DESC']],
        });

        const permissionsMap = await this.getPermissionsMap();
        const userProfilesMap = await this.getUserProfilesMap();

        return users.map((user) => {
            const currentPerms = permissionsMap[user.id] || this.getDefaultPermissions();
            const configPerms = currentPerms?.configuracoes || {};
            const isSystemAdmin =
                this.isProtectedAdmin(user) ||
                !!configPerms.update ||
                (!!configPerms.read && !!configPerms.create && !!configPerms.delete);

            return {
            isSystemAdmin,
            id: user.id,
            name: user.name,
            email: user.email,
            tenantId: user.tenantId || 'default',
            phone: userProfilesMap[user.id]?.phone || '',
            birthDate: userProfilesMap[user.id]?.birthDate || '',
            isActive: user.isActive,
            approved: user.isActive,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            permissions: isSystemAdmin
                ? this.getFullPermissions()
                : currentPerms,
        }});
    }

    async setUserActive(tenantId: string, userId: string, isActive: boolean) {
        const user = await this.userModel.findOne({ where: { id: userId, tenantId } });
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }
        if (this.isProtectedAdmin(user) && !isActive) {
            throw new BadRequestException('Nao e permitido revogar o acesso do usuario Admin');
        }

        user.isActive = isActive;
        await user.save();
        return {
            id: user.id,
            isActive: user.isActive,
            approved: user.isActive,
        };
    }

    async setUserPermissions(tenantId: string, userId: string, permissions: Record<string, any>) {
        const user = await this.userModel.findOne({ where: { id: userId, tenantId } });
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }
        if (this.isProtectedAdmin(user)) {
            throw new BadRequestException('Nao e permitido alterar as permissoes do usuario Admin');
        }

        const permissionsMap = await this.getPermissionsMap();
        permissionsMap[userId] = { ...this.getDefaultPermissions(), ...permissions };
        await this.setPermissionsMap(permissionsMap);

        return {
            id: userId,
            permissions: permissionsMap[userId],
        };
    }

    async setUserProfile(
        tenantId: string,
        userId: string,
        profile: { name?: string; email?: string; phone?: string; birthDate?: string },
    ) {
        const user = await this.userModel.findOne({ where: { id: userId, tenantId } });
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }

        const nextName = (profile.name || user.name).trim();
        const nextEmail = (profile.email || user.email).trim().toLowerCase();
        if (!nextName || !nextEmail) {
            throw new BadRequestException('Nome e email sao obrigatorios');
        }

        const existing = await this.userModel.findOne({ where: { email: nextEmail, tenantId } });
        if (existing && existing.id !== userId) {
            throw new BadRequestException('Email ja cadastrado para outro usuario');
        }

        user.name = nextName;
        user.email = nextEmail;
        await user.save();

        const userProfilesMap = await this.getUserProfilesMap();
        userProfilesMap[userId] = {
            phone: (profile.phone || '').trim(),
            birthDate: (profile.birthDate || '').trim(),
        };
        await this.setUserProfilesMap(userProfilesMap);

        return {
            id: user.id,
            name: user.name,
            email: user.email,
            tenantId: user.tenantId || 'default',
            phone: userProfilesMap[userId].phone,
            birthDate: userProfilesMap[userId].birthDate,
        };
    }

    async setUserPassword(tenantId: string, userId: string, password: string) {
        const user = await this.userModel.findOne({ where: { id: userId, tenantId } });
        if (!user) {
            throw new UnauthorizedException('Usuario nao encontrado');
        }

        const newPassword = (password || '').trim();
        if (newPassword.length < 6) {
            throw new BadRequestException('A senha deve ter pelo menos 6 caracteres');
        }

        const salt = await bcrypt.genSalt();
        user.passwordHash = await bcrypt.hash(newPassword, salt);
        await user.save();

        return { id: user.id, message: 'Senha atualizada com sucesso' };
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

    private getFullPermissions() {
        return {
            clientes: { read: true, create: true, update: true, delete: true },
            leads: { read: true, create: true, update: true, delete: true },
            produtos: { read: true, create: true, update: true, delete: true },
            negocios: { read: true, create: true, update: true, delete: true },
            financeiro: { read: true, create: true, update: true, delete: true },
            configuracoes: { read: true, create: true, update: true, delete: true },
            imoveis: { read: true, create: true, update: true, delete: true },
            reservas: { read: true, create: true, update: true, delete: true },
        };
    }

    private async getPermissionsMap(): Promise<Record<string, any>> {
        await this.ensureConfiguracoesValorText();
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
        await this.ensureConfiguracoesValorText();
        await this.configuracaoModel.upsert({
            chave: 'user_permissions_map',
            valor: JSON.stringify(map),
        });
    }

    private async getPasswordResetTokens(): Promise<Record<string, ResetTokenEntry>> {
        await this.ensureConfiguracoesValorText();
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
        await this.ensureConfiguracoesValorText();
        await this.configuracaoModel.upsert({
            chave: 'password_reset_tokens',
            valor: JSON.stringify(map),
        });
    }

    private async getUserProfilesMap(): Promise<Record<string, UserProfileEntry>> {
        await this.ensureConfiguracoesValorText();
        const config = await this.configuracaoModel.findByPk('user_profiles_map');
        if (!config?.valor) return {};
        try {
            const parsed = JSON.parse(config.valor);
            return typeof parsed === 'object' && parsed ? parsed : {};
        } catch {
            return {};
        }
    }

    private async setUserProfilesMap(map: Record<string, UserProfileEntry>) {
        await this.ensureConfiguracoesValorText();
        await this.configuracaoModel.upsert({
            chave: 'user_profiles_map',
            valor: JSON.stringify(map),
        });
    }

    private async ensureConfiguracoesValorText() {
        if (this.ensuredConfiguracoesText) return;
        this.ensuredConfiguracoesText = true;

        try {
            await this.configuracaoModel.sequelize?.query(`
                ALTER TABLE configuracoes
                ALTER COLUMN valor TYPE TEXT USING valor::TEXT;
            `);
        } catch {
            // Keep startup resilient if DB user has no DDL privilege or column is already TEXT.
        }
    }

    private isProtectedAdmin(user: User | null | undefined): boolean {
        if (!user) return false;
        return this.isAdminIdentity(user.email, user.name);
    }

    private isAdminIdentity(emailRaw?: string, nameRaw?: string): boolean {
        const email = (emailRaw || '').trim().toLowerCase();
        const name = (nameRaw || '').trim().toLowerCase();
        return email === 'admin@example.com' || email.startsWith('admin@') || name.includes('admin');
    }

    async sendPasswordResetEmail(email: string, name: string, resetLink: string) {
        console.log(`[PASSWORD_RESET_LINK_SIMULATED] ${email} => ${resetLink}`);
        // Nodemailer disabled temporarily
    }
}
