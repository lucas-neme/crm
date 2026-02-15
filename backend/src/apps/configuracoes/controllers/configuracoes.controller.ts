import { Body, Controller, ForbiddenException, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ConfiguracoesService } from '../services/configuracoes.service';
import { getTenantId } from '@/common/tenant/tenant-request.util';

@ApiTags('configuracoes')
@Controller('configuracoes')
export class ConfiguracoesController {
  constructor(private readonly configService: ConfiguracoesService) {}

  private ensureSystemAdmin(req: any) {
    const isSystemAdmin = !!req?.user?.isSystemAdmin;
    const email = String(req?.user?.email || '').toLowerCase();
    const name = String(req?.user?.name || '').toLowerCase();
    const hasAdminIdentity = email === 'admin@example.com' || email.startsWith('admin@') || name.includes('admin');
    if (!isSystemAdmin && !hasAdminIdentity) {
      throw new ForbiddenException('Apenas o administrador pode alterar configuracoes de modulos');
    }
  }

  @Get('public/login_phrase')
  @ApiOperation({ summary: 'Obter frase da tela de login (publico por tenant)' })
  async getLoginPhrase(@Request() req: any) {
    const tenantId = getTenantId(req);
    const valor = await this.configService.getConfiguration(tenantId, 'login_phrase');
    return { chave: 'login_phrase', valor: valor || '' };
  }

  @Get('public/branding')
  @ApiOperation({ summary: 'Obter branding publico do tenant para tela de login' })
  async getPublicBranding(@Request() req: any) {
    const tenantId = getTenantId(req);
    const valor = await this.configService.getConfiguration(tenantId, 'branding_settings');
    if (!valor) {
      return { chave: 'branding_settings', valor: {} };
    }
    try {
      return { chave: 'branding_settings', valor: JSON.parse(valor) };
    } catch {
      return { chave: 'branding_settings', valor: {} };
    }
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get()
  @ApiOperation({ summary: 'Obter todas as configuracoes' })
  async getAll(@Request() req: any) {
    return this.configService.getAll(getTenantId(req));
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Get(':chave')
  @ApiOperation({ summary: 'Obter uma configuracao por chave' })
  async get(@Request() req: any, @Param('chave') chave: string) {
    const tenantId = getTenantId(req);
    const valor = await this.configService.getConfiguration(tenantId, chave);
    return { chave, valor };
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post(':chave')
  @ApiOperation({ summary: 'Definir o valor de uma configuracao' })
  async set(@Request() req: any, @Param('chave') chave: string, @Body('valor') valor: string) {
    if (chave === 'produto_modulo' || chave === 'enabled_modules') {
      this.ensureSystemAdmin(req);
    }
    const tenantId = getTenantId(req);
    return this.configService.setConfiguration(tenantId, chave, valor || '');
  }
}
