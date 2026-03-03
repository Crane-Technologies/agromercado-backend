import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class GetSalesQueryDto {
  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Filtrar por ID de venta' })
  @IsOptional()
  @IsUUID()
  saleId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Filtrar por ID del vendedor' })
  @IsOptional()
  @IsUUID()
  sellerId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440002', description: 'Filtrar por ID del post de ganado' })
  @IsOptional()
  @IsUUID()
  livestockPostId?: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440003', description: 'Filtrar por ID del comprador' })
  @IsOptional()
  @IsUUID()
  buyerId?: string;

  @ApiPropertyOptional({ example: 20, minimum: 1, description: 'Número máximo de resultados' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ example: 0, minimum: 0, description: 'Número de resultados a omitir' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;
}
