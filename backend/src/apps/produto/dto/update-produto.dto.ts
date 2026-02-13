import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, Min, MinLength, IsBoolean } from 'class-validator';

export class UpdateProdutoDto {
  @ApiProperty({
    example: 'Notebook Dell',
    description: 'Nome do produto',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  nome?: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade em estoque',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quantidade?: number;

  @ApiProperty({
    example: 2500.00,
    description: 'Valor unitário do produto',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  valorUnitario?: number;

  @ApiProperty({
    example: true,
    description: 'Status do produto (ativo/inativo)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
