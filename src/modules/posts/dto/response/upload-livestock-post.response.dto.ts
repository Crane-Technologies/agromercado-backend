import {
  IsUUID,
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class FilesInfoDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success!: boolean;

  @ApiProperty({ example: '3 archivos subidos exitosamente' })
  @IsString()
  message!: string;

  @ApiProperty({ example: 3 })
  @IsInt()
  uploadedCount!: number;
}

export class UploadLivestockPostResponseDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'UUID del post de ganado creado' })
  @IsUUID()
  livestockPostId!: string;

  @ApiPropertyOptional({ type: () => FilesInfoDto })
  @IsOptional()
  @ValidateNested()
  filesInfo?: FilesInfoDto;
}
