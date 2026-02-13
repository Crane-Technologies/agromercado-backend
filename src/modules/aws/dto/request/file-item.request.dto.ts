import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class FileItemDto {
  @IsString()
  fileName!: string;

  @IsInt()
  fileSizeBytes!: number;

  @IsString()
  mimeType!: string;

  @IsUUID()
  @IsOptional()
  livestockPostId?: string;

  @IsBoolean()
  @IsOptional()
  isMainFile?: boolean;

  @IsInt()
  @IsOptional()
  displayOrder?: number;
}
