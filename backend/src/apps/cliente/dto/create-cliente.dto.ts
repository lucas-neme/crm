import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsBoolean, IsOptional, IsEnum } from 'class-validator';
import { PessoaTipoEnum } from '../../../common/enums/pessoa-tipo.enum';

export class CreateClienteDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome do cliente',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({
    example: 'joao.silva@example.com',
    description: 'Email do cliente',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '(11) 99999-9999',
    description: 'Telefone do cliente',
  })
  @IsNotEmpty()
  @IsString()
  telefone: string;

  @ApiProperty({
    description: 'Tipo de pessoa',
    enum: PessoaTipoEnum,
    example: PessoaTipoEnum.FISICA,
  })
  @IsEnum(PessoaTipoEnum, { message: 'Tipo de pessoa inválido' })
  @IsNotEmpty({ message: 'Tipo de pessoa é obrigatório' })
  tipoPessoa: PessoaTipoEnum;

  @IsOptional()
  @IsBoolean()
  isAtivo?: boolean;

  @ApiProperty({
    example: '123456789',
    description: 'Telegram Chat ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  chatId?: string;

  @ApiProperty({ example: '1990-01-01', required: false })
  @IsOptional()
  @IsString()
  dtNascimento?: string;

  @ApiProperty({ example: '123.456.789-00', required: false })
  @IsOptional()
  @IsString()
  documento?: string;

  @ApiProperty({ example: 'COMPRA', required: false, enum: ['VENDA', 'COMPRA', 'ALUGUEL'] })
  @IsOptional()
  @IsString()
  tipoCliente?: string;

  @ApiProperty({ example: 'Cliente prefere contato via WhatsApp', required: false })
  @IsOptional()
  @IsString()
  observacoes?: string;

  @ApiProperty({ example: 'INSTAGRAM', required: false })
  @IsOptional()
  @IsString()
  origem?: string;

  @ApiProperty({ example: 'COMPRA', required: false })
  @IsOptional()
  @IsString()
  interesse?: string;

  @ApiProperty({ example: 'NOVO', required: false })
  @IsOptional()
  @IsString()
  pipelineStage?: string;

  @ApiProperty({ example: 'MORNA', required: false })
  @IsOptional()
  @IsString()
  temperatura?: string;

}
