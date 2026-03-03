import { IsUUID, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePurchaseRequestDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del post de ganado' })
  @IsUUID()
  livestockPostId!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'UUID del comprador potencial' })
  @IsUUID()
  potentialBuyer!: string;

  @ApiProperty({ example: 5, minimum: 1, description: 'Cantidad solicitada de animales' })
  @IsInt()
  @Min(1)
  requestedQuantity!: number;

  @ApiPropertyOptional({ example: 'Me interesa el lote, ¿acepta visita?' })
  @IsString()
  @IsOptional()
  message?: string;
}
