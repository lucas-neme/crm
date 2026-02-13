import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, Min, MinLength, IsBoolean, IsOptional } from 'class-validator';

export class CreateProdutoDto {
  @ApiProperty({
    example: 'Notebook Dell',
    description: 'Nome do produto',
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  nome: string;

  @ApiProperty({
    example: 10,
    description: 'Quantidade em estoque',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantidade: number;

  @ApiProperty({
    example: 2500.00,
    description: 'Valor unitário do produto',
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  valorUnitario: number;

  @ApiProperty({
    example: true,
    description: 'Status do produto (ativo/inativo)',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
