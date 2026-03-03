import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FileItemDto {
  @ApiProperty({ example: 'foto-ganado.jpg', description: 'Nombre del archivo' })
  @IsString()
  fileName!: string;

  @ApiProperty({ example: 204800, description: 'Tamaño del archivo en bytes' })
  @IsInt()
  fileSizeBytes!: number;

  @ApiProperty({ example: 'image/jpeg', description: 'Tipo MIME del archivo' })
  @IsString()
  mimeType!: string;

  @ApiPropertyOptional({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del post de ganado asociado' })
  @IsUUID()
  @IsOptional()
  livestockPostId?: string;

  @ApiPropertyOptional({ example: true, description: 'Indica si es el archivo principal del post' })
  @IsBoolean()
  @IsOptional()
  isMainFile?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Orden de visualización del archivo' })
  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
