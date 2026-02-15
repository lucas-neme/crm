import { Controller, ForbiddenException, Get, Post, Body, Param, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('configuracoes')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('configuracoes')
export class ConfiguracoesController {
    constructor(private readonly configService: ConfiguracoesService) { }

    private ensureSystemAdmin(req: any) {
        const isSystemAdmin = !!req?.user?.isSystemAdmin;
        const email = String(req?.user?.email || '').toLowerCase();
        const name = String(req?.user?.name || '').toLowerCase();
        const hasAdminIdentity = email === 'admin@example.com' || email.startsWith('admin@') || name.includes('admin');
        if (!isSystemAdmin && !hasAdminIdentity) {
            throw new ForbiddenException('Apenas o administrador pode alterar configuracoes de modulos');
        }
    }

    @Get()
    @ApiOperation({ summary: 'Obter todas as configurações' })
    async getAll(@Request() req: any) {
        return this.configService.getAll(getTenantId(req));
    }

    @Get(':chave')
    @ApiOperation({ summary: 'Obter uma configuração por chave' })
    async get(@Request() req: any, @Param('chave') chave: string) {
        const tenantId = getTenantId(req);
        const valor = await this.configService.getConfiguration(tenantId, chave);
        return { chave, valor };
    }

    @Post(':chave')
    @ApiOperation({ summary: 'Definir o valor de uma configuração' })
    async set(@Request() req: any, @Param('chave') chave: string, @Body('valor') valor: string) {
        if (chave === 'produto_modulo' || chave === 'enabled_modules') {
            this.ensureSystemAdmin(req);
        }
        const tenantId = getTenantId(req);
        return this.configService.setConfiguration(tenantId, chave, valor);
    }
}
