import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  UploadLivestockPostDto,
  UpdateLivestockPostDto,
  UploadLivestockPostResponseDto,
} from './dto';

import { LivestockPostsRepository } from './posts.repository';
import { AwsService } from '../aws/aws.service';

@Injectable()
export class LivestockPostsService {
  constructor(
    private readonly postsRepository: LivestockPostsRepository,
    private readonly awsService: AwsService,
  ) {}

  async uploadLivestockPost(
    dto: UploadLivestockPostDto,
    files: Express.Multer.File[],
  ): Promise<UploadLivestockPostResponseDto> {
    try {
      const livestockPostId = await this.postsRepository.createLivestockPost(
        dto.post,
      );

      if (
        !files ||
        files.length === 0 ||
        !dto.files ||
        dto.files.length === 0
      ) {
        return {
          livestockPostId,
          filesInfo: {
            success: true,
            message: 'Post creado sin archivos',
            uploadedCount: 0,
          },
        };
      }

      const filesWithPostId = dto.files.map((file) => ({
        ...file,
        livestockPostId,
      }));

      const uploadFilesDto = { files: filesWithPostId };
      const uploadResponse = await this.awsService.uploadFiles(
        files,
        uploadFilesDto,
      );

      if (!uploadResponse.success) {
        throw new Error(`Error al subir archivos: ${uploadResponse.message}`);
      }

      return {
        livestockPostId,
        filesInfo: {
          success: uploadResponse.success,
          message: uploadResponse.message,
          uploadedCount: uploadResponse.files?.length || 0,
        },
      };
    } catch (error) {
      throw new InternalServerErrorException(
        error instanceof Error
          ? error.message
          : 'Failed to create livestock post',
      );
    }
  }

  async getAll() {
    return `This action returns all posts`;
  }

  async findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async update(id: number, updateLivestockPostDto: UpdateLivestockPostDto) {
    return `This action updates a #${id} post`;
  }

  async remove(id: number) {
    return `This action removes a #${id} post`;
  }
}
