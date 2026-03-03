import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SexType } from '../../enum/sex-type.enum';

export class SearchLivestockPostsQueryDto {
  @ApiProperty({
    example: 'novillas brahman',
    description: 'Término de búsqueda por nombre o detalles del post',
    minLength: 1,
  })
  @IsString()
  @MinLength(1)
  q!: string;

  @ApiPropertyOptional({
    example: 0.15,
    description: 'Relevancia mínima (0-1). Por defecto 0.15',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minRelevance?: number;

  @ApiPropertyOptional({
    example: 20,
    description: 'Número máximo de resultados (máx. 100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({
    example: 0,
    description: 'Número de resultados a omitir',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por municipio' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  townshipId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por estado/región' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  stateId?: number;

  @ApiPropertyOptional({
    example: 200,
    description: 'Peso promedio mínimo (kg)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minWeight?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Peso promedio máximo (kg)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxWeight?: number;

  @ApiPropertyOptional({ example: 2.5, description: 'Precio mínimo por kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPricePerKg?: number;

  @ApiPropertyOptional({ example: 10, description: 'Precio máximo por kg' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPricePerKg?: number;

  @ApiPropertyOptional({
    example: 500,
    description: 'Precio mínimo por unidad',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPricePerUnit?: number;

  @ApiPropertyOptional({
    example: 2000,
    description: 'Precio máximo por unidad',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPricePerUnit?: number;

  @ApiPropertyOptional({
    example: 1,
    description: 'Filtrar por tipo de ganado',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  livestockTypeId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Filtrar por sector' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  sectorId?: number;

  @ApiPropertyOptional({
    enum: SexType,
    example: SexType.FEMALE,
    description: 'Filtrar por sexo',
  })
  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;
}
