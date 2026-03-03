import { PartialType } from '@nestjs/swagger';
import { CreateLivestockPostDto } from './create-livestock-post.dto';

export class UpdateLivestockPostDto extends PartialType(
  CreateLivestockPostDto,
) {}
