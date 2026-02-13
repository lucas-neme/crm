import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';

class EnderecoDto {
  @ApiProperty({ example: 'Rua das Flores', required: false })
  @IsString()
  @IsOptional()
  logradouro?: string;

  @ApiProperty({ example: '123', required: false })
  @IsString()
  @IsOptional()
  numero?: string;

  @ApiProperty({ example: 'Apto 45', required: false })
  @IsString()
  @IsOptional()
  complemento?: string;

  @ApiProperty({ example: 'Centro', required: false })
  @IsString()
  @IsOptional()
  bairro?: string;

  @ApiProperty({ example: 'São Paulo', required: false })
  @IsString()
  @IsOptional()
  cidade?: string;

  @ApiProperty({ example: 'SP', required: false })
  @IsString()
  @IsOptional()
  estado?: string;

  @ApiProperty({ example: 'Brasil', required: false })
  @IsString()
  @IsOptional()
  pais?: string;

  @ApiProperty({ example: '01234-567', required: false })
  @IsString()
  @IsOptional()
  cep?: string;
}

class ProdutoNegocioDto {
  @ApiProperty({ example: 'uuid-produto', required: false })
  @IsString()
  @IsOptional()
  produtoId?: string;

  @ApiProperty({ example: 2, required: false })
  @IsNumber()
  @IsOptional()
  @Min(1)
  quantidade?: number;

  @ApiProperty({ example: 2500.00, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  valorUnitario?: number;
}

export class UpdateNegocioDto {
  @ApiProperty({
    example: 'Venda Notebook',
    description: 'Nome do negócio',
    required: false,
  })
  @IsOptional()
  @IsString()
  nome?: string;

  @ApiProperty({
    example: true,
    description: 'Se requer entrega',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  entrega?: boolean;

  @ApiProperty({
    description: 'Endereço de entrega',
    type: EnderecoDto,
    required: false,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => EnderecoDto)
  enderecoEntrega?: EnderecoDto;

  @ApiProperty({
    description: 'Lista de produtos',
    type: [ProdutoNegocioDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProdutoNegocioDto)
  produtos?: ProdutoNegocioDto[];
}
