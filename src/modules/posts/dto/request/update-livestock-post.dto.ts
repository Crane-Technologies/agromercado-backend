import { PartialType } from '@nestjs/mapped-types';
import { CreateLivestockPostDto } from './create-livestock-post.dto';

export class UpdateLivestockPostDto extends PartialType(
  CreateLivestockPostDto,
) {}
