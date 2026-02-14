import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { LivestockPostsService } from './posts.service';
import { UploadLivestockPostDto, UpdateLivestockPostDto } from './dto';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('posts')
export class LivestockPostsController {
  constructor(private readonly livestockPostsService: LivestockPostsService) {}

  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadLivestockPost(
    @Body() dto: UploadLivestockPostDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    console.log('Received DTO:', dto);
    return await this.livestockPostsService.uploadLivestockPost(dto, files);
  }

  @Get()
  getAll() {
    return this.livestockPostsService.getAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.livestockPostsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLivestockPostDto: UpdateLivestockPostDto,
  ) {
    return this.livestockPostsService.update(+id, updateLivestockPostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.livestockPostsService.remove(+id);
  }
}
