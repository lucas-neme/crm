import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsBoolean, IsArray, ValidateNested, IsNumber, Min, ArrayMinSize, IsDateString, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class NegocioProdutoDto {
  @ApiProperty({ example: 'uuid-produto' })
  @IsNotEmpty()
  @IsString()
  produtoId: string;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  quantidade: number;

  @ApiProperty({ example: 2500.0 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @ApiProperty({ example: 50.0, required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  desconto?: number;
}

export class CreateNegocioDto {
  @ApiProperty({
    example: 'uuid-cliente',
    description: 'ID do cliente',
  })
  @IsNotEmpty()
  @IsString()
  clienteId: string;

  @ApiProperty({
    example: '2026-02-12',
    description: 'Data da venda',
  })
  @IsNotEmpty()
  @IsDateString()
  dataVenda: string;

  @ApiProperty({
    example: true,
    description: 'Se requer entrega',
  })
  @IsNotEmpty()
  @IsBoolean()
  entrega: boolean;

  @ApiProperty({
    example: '2026-02-15',
    description: 'Data prevista de entrega',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dataEntrega?: string;

  @ApiProperty({
    description: 'ID do endereço de entrega',
    required: false,
  })
  @IsOptional()
  @IsString()
  enderecoEntregaId?: string;

  @ApiProperty({
    example: 100.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  descontoGeral?: number;

  @ApiProperty({
    description: 'Lista de produtos do negócio',
    type: [NegocioProdutoDto],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => NegocioProdutoDto)
  produtos: NegocioProdutoDto[];
}
