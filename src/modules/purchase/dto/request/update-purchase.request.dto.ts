import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class UpdatePurchaseRequestDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  purchaseStatusId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  // Alias temporal para compatibilidad con clientes que envían statusId.
  statusId?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  requestedQuantity?: number;

  @IsOptional()
  @IsString()
  message?: string;
}
