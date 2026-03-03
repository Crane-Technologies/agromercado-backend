import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNotificationRequestDto {
  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440000',
    description: 'UUID del post de ganado asociado',
  })
  @IsUUID()
  livestockPostId!: string;

  @ApiProperty({
    example: '550e8400-e29b-41d4-a716-446655440001',
    description: 'UUID del usuario que envía la notificación',
  })
  @IsUUID()
  sentBy!: string;

  @ApiProperty({
    example: 1,
    description: 'ID del tipo de notificación de compra',
  })
  @IsInt()
  purchaseNotificationTypeId!: number;

  @ApiProperty({
    example: 'Estoy interesado en su lote de novillas, ¿podríamos hablar?',
  })
  @IsString()
  message!: string;

  @ApiPropertyOptional({ example: false, default: false })
  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
