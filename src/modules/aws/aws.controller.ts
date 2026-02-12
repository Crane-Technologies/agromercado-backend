import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseInterceptors,
  UploadedFiles,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import type { Express } from 'express';
import { AwsService } from './aws.service';
import { UploadFilesDto, UploadFilesResponseDto } from './dto';
import { FilesValidationPipe } from './pipes';

@Controller('aws/files')
export class AwsController {
  constructor(private readonly awsService: AwsService) {}

  @Post('upload')
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(
    @UploadedFiles(new FilesValidationPipe()) files: Express.Multer.File[],
    @Body() uploadFilesDto: UploadFilesDto,
  ): Promise<UploadFilesResponseDto> {
    return this.awsService.uploadFiles(files, uploadFilesDto);
  }

  @Get(':fileId/download')
  async getDownloadUrl(
    @Param('fileId') fileId: string,
    @Query('expiresIn') expiresIn?: string,
  ): Promise<{ url: string }> {
    const expirationTime = expiresIn ? parseInt(expiresIn, 10) : 3600;
    const url = await this.awsService.getDownloadUrl(fileId, expirationTime);
    return { url };
  }

  @Get('post/:livestockPostId')
  async getFilesByPost(@Param('livestockPostId') livestockPostId: string) {
    const files = await this.awsService.getFilesByPost(livestockPostId);
    return {
      success: true,
      count: files.length,
      files,
    };
  }

  @Delete(':fileId')
  async deleteFile(
    @Param('fileId') fileId: string,
  ): Promise<UploadFilesResponseDto> {
    return this.awsService.deleteFile(fileId);
  }

  @Delete()
  async deleteFiles(
    @Body('fileIds') fileIds: string[],
  ): Promise<UploadFilesResponseDto> {
    if (!fileIds || fileIds.length === 0) {
      throw new BadRequestException('No file IDs provided');
    }
    return this.awsService.deleteFiles(fileIds);
  }

  @Get('health')
  healthCheck() {
    return { status: 'ok' };
  }
}
