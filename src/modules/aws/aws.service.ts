import {
  Injectable,
  Inject,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';

import { ConfigService } from '@nestjs/config';

import {
  UploadFilesDto,
  UploadFilesResponseDto,
  FileMetadata,
  FileItemDto,
} from './dto';

interface FileMetadataInput extends FileItemDto {
  s3Bucket: string;
  s3Key: string;
}

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  private readonly s3Bucket: string;
  private readonly s3Region: string;

  constructor(
    @Inject(DATABASE) private readonly db: Database,
    private readonly configService: ConfigService,
  ) {
    const bucket = this.configService.get<string>('AWS_S3_BUCKET_NAME');
    const region = this.configService.get<string>('AWS_REGION');
    const accessKeyId = this.configService.get<string>('AWS_ACCESS_KEY_ID');
    const secretAccessKey = this.configService.get<string>(
      'AWS_SECRET_ACCESS_KEY',
    );

    if (!bucket || !region || !accessKeyId || !secretAccessKey) {
      throw new Error(
        'Faltan variables de entorno de AWS: AWS_S3_BUCKET_NAME, AWS_REGION, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY',
      );
    }

    this.s3Bucket = bucket;
    this.s3Region = region;
    this.s3Client = new S3Client({
      region: this.s3Region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });
  }

  async uploadFiles(
    files: Express.Multer.File[],
    dto: UploadFilesDto,
  ): Promise<UploadFilesResponseDto> {
    try {
      const uploadedFiles: FileMetadata[] = [];
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const fileConfig = dto.files[i];

          if (!fileConfig) {
            throw new BadRequestException(
              `Configuración de archivo faltante para el archivo en posición ${i}`,
            );
          }

          if (!fileConfig.livestockPostId) {
            throw new BadRequestException(
              `livestockPostId requerido para el archivo en posición ${i}`,
            );
          }

          const s3Key = this.generateS3Key(
              fileConfig.livestockPostId,
              file.originalname,
            ),
            uploadObject = {
              Bucket: this.s3Bucket,
              Key: s3Key,
              Body: file.buffer,
              ContentType: file.mimetype,
              Metadata: {
                'livestock-post-id': fileConfig.livestockPostId,
                'original-name': file.originalname,
              },
            },
            uploadCommand = new PutObjectCommand(uploadObject);
          await this.s3Client.send(uploadCommand);

          const {
              fileName,
              fileSizeBytes,
              mimeType,
              isMainFile,
              displayOrder,
            } = fileConfig,
            fileMetadata = await this.saveFileMetadata({
              fileName: fileName,
              fileSizeBytes: fileSizeBytes,
              mimeType: mimeType,
              livestockPostId: fileConfig.livestockPostId,
              s3Bucket: this.s3Bucket,
              s3Key,
              isMainFile: isMainFile || false,
              displayOrder: displayOrder || i,
            });

          uploadedFiles.push(fileMetadata);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error en archivo ${files[i].originalname}: ${message}`);
        }
      }

      if (uploadedFiles.length === 0) {
        throw new InternalServerErrorException(
          `No se pudieron subir los archivos: ${errors.join(', ')}`,
        );
      }

      return {
        success: uploadedFiles.length === files.length,
        message: `${uploadedFiles.length}/${files.length} archivos subidos exitosamente`,
        files: uploadedFiles,
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al subir archivos: ${message}`,
      );
    }
  }

  async getDownloadUrl(
    fileId: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const file = (await this.db.query(queries.aws.getFileMetadata, [
        fileId,
      ])) as FileMetadata;

      if (!file) {
        throw new BadRequestException('Archivo no encontrado');
      }

      const getCommand = new GetObjectCommand({
        Bucket: this.s3Bucket,
        Key: file.s3_key,
      });

      const url = await getSignedUrl(this.s3Client, getCommand, {
        expiresIn,
      });

      return url;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al generar URL de descarga: ${message}`,
      );
    }
  }

  async getFilesByPost(
    livestockPostId: string,
    mainOnly?: boolean,
  ): Promise<FileMetadata[]> {
    try {
      const query = mainOnly
        ? queries.aws.getMainFileByLivestockPost
        : queries.aws.getFilesByLivestockPost;

      const files: FileMetadata[] = (await this.db.query(query, [
        livestockPostId,
      ])) as FileMetadata[];
      return files || [];
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al obtener archivos: ${message}`,
      );
    }
  }

  async deleteFile(fileId: string): Promise<UploadFilesResponseDto> {
    try {
      const file: FileMetadata = (await this.db.query(
        queries.aws.getFileMetadata,
        [fileId],
      )) as FileMetadata;

      if (!file) {
        throw new BadRequestException('Archivo no encontrado');
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.s3Bucket,
        Key: file.s3_key,
      });

      await this.s3Client.send(deleteCommand);

      await this.db.query(queries.aws.deleteFile, [fileId]);

      return {
        success: true,
        message: 'Archivo eliminado exitosamente',
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al eliminar archivo: ${message}`,
      );
    }
  }

  async deleteFiles(fileIds: string[]): Promise<UploadFilesResponseDto> {
    try {
      const deletedFiles: string[] = [];
      const errors: string[] = [];

      for (const fileId of fileIds) {
        try {
          const file: FileMetadata = (await this.db.query(
            queries.aws.getFileMetadata,
            [fileId],
          )) as FileMetadata;
          if (!file) {
            errors.push(`Archivo ${fileId} no encontrado`);
            continue;
          }

          const deleteCommand = new DeleteObjectCommand({
            Bucket: this.s3Bucket,
            Key: file.s3_key,
          });

          await this.s3Client.send(deleteCommand);

          await this.db.query(queries.aws.deleteFile, [fileId]);
          deletedFiles.push(fileId);
        } catch (error) {
          const message =
            error instanceof Error ? error.message : 'Unknown error';
          errors.push(`Error eliminando ${fileId}: ${message}`);
        }
      }

      if (deletedFiles.length === 0) {
        throw new InternalServerErrorException(
          `No se pudieron eliminar los archivos: ${errors.join(', ')}`,
        );
      }

      return {
        success: deletedFiles.length === fileIds.length,
        message: `${deletedFiles.length}/${fileIds.length} archivos eliminados exitosamente`,
      };
    } catch (error) {
      if (error instanceof InternalServerErrorException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al eliminar archivos: ${message}`,
      );
    }
  }

  private generateS3Key(livestockPostId: string, originalName: string): string {
    const timestamp = Date.now();
    const sanitizedName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_');
    return `livestock-posts/${livestockPostId}/${timestamp}-${sanitizedName}`;
  }

  private async saveFileMetadata(
    fileData: FileMetadataInput,
  ): Promise<FileMetadata> {
    const result = (await this.db.query(queries.aws.insertLivestockPostFile, [
      fileData.fileName,
      fileData.fileSizeBytes,
      fileData.mimeType,
      fileData.livestockPostId,
      fileData.s3Bucket,
      fileData.s3Key,
      fileData.isMainFile || false,
      fileData.displayOrder || 0,
    ])) as FileMetadata;

    console.log('Metadata guardada:', result);
    return result;
  }
}
