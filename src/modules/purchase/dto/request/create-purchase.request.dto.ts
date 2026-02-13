import { IsUUID, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreatePurchaseRequestDto {
  @IsUUID()
  livestockPostId!: string;

  @IsUUID()
  potentialBuyer!: string;

  @IsInt()
  @Min(1)
  requestedQuantity!: number;

  @IsString()
  @IsOptional()
  message?: string;
}
