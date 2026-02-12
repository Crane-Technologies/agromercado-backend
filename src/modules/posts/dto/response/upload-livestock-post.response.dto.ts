import {
  IsUUID,
  IsOptional,
  IsBoolean,
  IsString,
  IsInt,
  ValidateNested,
} from 'class-validator';

class FilesInfoDto {
  @IsBoolean()
  success!: boolean;

  @IsString()
  message!: string;

  @IsInt()
  uploadedCount!: number;
}

export class UploadLivestockPostResponseDto {
  @IsUUID()
  livestockPostId!: string;

  @IsOptional()
  @ValidateNested()
  filesInfo?: FilesInfoDto;
}
