import { Type } from 'class-transformer';
import { IsNumber, IsOptional, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSaleRequestDto {
  @ApiPropertyOptional({ example: 8, minimum: 1, description: 'Cantidad de animales vendidos' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  quantity?: number;

  @ApiPropertyOptional({ example: 2800.5, minimum: 0.01, description: 'Peso total del lote en kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  totalWeightKg?: number;

  @ApiPropertyOptional({ example: 2.5, minimum: 0.01, description: 'Precio por kg en USD' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  pricePerKg?: number;

  @ApiPropertyOptional({ example: 850, minimum: 0.01, description: 'Precio por unidad en USD' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0.01)
  pricePerUnit?: number;

  @ApiPropertyOptional({ example: 5, minimum: 0, description: 'Porcentaje de comisión (0-100)' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  commissionPercentage?: number;
}
