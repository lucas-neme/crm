import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import { Configuracao } from '../../configuracoes/models/configuracao.model';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User)
        private userModel: typeof User,
        @InjectModel(Configuracao)
        private readonly configuracaoModel: typeof Configuracao,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userModel.findOne({ where: { email } });
        if (user && (await user.validatePassword(pass))) {
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

    // Temporary method to seed a user if none exists
    async seedAdminUser() {
        const count = await this.userModel.count();
        if (count === 0) {
            const salt = await bcrypt.genSalt();
            const passwordHash = await bcrypt.hash('admin123', salt);
            await this.userModel.create({
                email: 'admin@example.com',
                name: 'Admin',
                passwordHash: passwordHash,
                isActive: true,
            });
            console.log('Admin user created: admin@example.com / admin123');
        }
    }

    async register(name: string, email: string, password: string) {
        const existing = await this.userModel.findOne({ where: { email } });
        if (existing) {
            return { message: 'Email já cadastrado' };
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
            message: 'Usuário criado com sucesso e aguardando aprovação do administrador',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                isActive: user.isActive,
            },
        };
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
            throw new UnauthorizedException('Usuário não encontrado');
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
            throw new UnauthorizedException('Usuário não encontrado');
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
}
