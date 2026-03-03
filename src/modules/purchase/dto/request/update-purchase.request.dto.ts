import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePurchaseRequestDto {
  @ApiPropertyOptional({ example: 2, minimum: 1, description: 'ID del nuevo estado de la solicitud' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  purchaseStatusId?: number;

  @ApiPropertyOptional({ example: 2, minimum: 1, description: 'Alias temporal para compatibilidad con clientes que envían statusId' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // Alias temporal para compatibilidad con clientes que envían statusId.
  statusId?: number;

  @ApiPropertyOptional({ example: 3, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestedQuantity?: number;

  @ApiPropertyOptional({ example: 'Actualizo mi solicitud a 3 animales.' })
  @IsOptional()
  @IsString()
  message?: string;
}
