import { ValidateNested, IsArray, ArrayMinSize } from 'class-validator';
import { CreateLivestockPostDto } from './create-livestock-post.dto';
import { FileItemDto } from '../../../aws/dto/request/file-item.dto';

export class UploadLivestockPostDto {
  @ValidateNested()
  post!: CreateLivestockPostDto;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  files!: FileItemDto[];
}
