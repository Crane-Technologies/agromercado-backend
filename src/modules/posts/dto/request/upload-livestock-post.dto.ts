import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateLivestockPostDto } from './create-livestock-post.dto';
import { FileItemDto } from '../../../aws/dto/request/file-item.request.dto';

export class UploadLivestockPostDto {
  @ApiProperty({
    type: () => CreateLivestockPostDto,
    description:
      'Datos del post de ganado (enviar como JSON string en multipart/form-data)',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @Type(() => CreateLivestockPostDto)
  @ValidateNested()
  post!: CreateLivestockPostDto;

  @ApiPropertyOptional({
    type: () => [FileItemDto],
    description:
      'Metadatos de los archivos a subir (enviar como JSON string en multipart/form-data)',
  })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @Type(() => FileItemDto)
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @IsOptional()
  files?: FileItemDto[];
}
