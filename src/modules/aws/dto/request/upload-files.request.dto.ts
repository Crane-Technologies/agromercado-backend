import {
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { FileItemDto } from './file-item.request.dto';

export class UploadFilesDto {
  @ApiProperty({ type: () => [FileItemDto], minItems: 1, maxItems: 10, description: 'Lista de metadatos de archivos a subir (mínimo 1, máximo 10)' })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @ValidateNested({ each: true })
  files!: FileItemDto[];
}
