import { IsString, IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum } from 'class-validator';

export class CreateContaDto {
    @IsString()
    @IsNotEmpty()
    descricao: string;

    @IsNumber()
    @IsNotEmpty()
    valor: number;

    // Use IsString or IsDateString depending on exact format, IsDateString is safer for ISO 'YYYY-MM-DD'
    @IsDateString()
    @IsNotEmpty()
    dtVencimento: string;

    @IsOptional()
    @IsString()
    observacoes?: string;

    @IsOptional()
    @IsString()
    status?: string;

    @IsOptional()
    @IsString()
    clienteId?: string;
}
