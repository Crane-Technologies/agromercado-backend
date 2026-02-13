import {
  ValidateNested,
  IsArray,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateLivestockPostDto } from './create-livestock-post.dto';
import { FileItemDto } from '../../../aws/dto/request/file-item.request.dto';

export class UploadLivestockPostDto {
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return JSON.parse(value);
    }
    return value;
  })
  @Type(() => CreateLivestockPostDto)
  @ValidateNested()
  post!: CreateLivestockPostDto;

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
