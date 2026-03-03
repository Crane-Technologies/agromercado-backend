import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FileMetadata } from './file-metadata.response.dto';

export class UploadFilesResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'Archivo subido exitosamente' })
  message!: string;

  @ApiPropertyOptional({ type: () => FileMetadata })
  file?: FileMetadata;

  @ApiPropertyOptional({ type: () => [FileMetadata] })
  files?: FileMetadata[];

  @ApiPropertyOptional({ example: 'Error al procesar el archivo' })
  error?: string;
}
