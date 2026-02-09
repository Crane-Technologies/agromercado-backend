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
import {
  UploadFileDto,
  BatchUploadFileDto,
  UploadResponseDto,
  FileMetadata,
} from './dto';
import Database from '@crane-technologies/database';
import { queries } from '../database/queries';

@Injectable()
export class AwsService {
  private readonly s3Client: S3Client;
  private readonly s3Bucket: string;
  private readonly s3Region: string;

  constructor(
    @Inject('DATABASE_CONNECTION') private readonly database: Database,
  ) {
    const bucket = process.env.AWS_S3_BUCKET_NAME;
    const region = process.env.AWS_REGION;
    const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

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

  async uploadFile(
    file: Express.Multer.File,
    uploadDto: UploadFileDto,
  ): Promise<FileMetadata> {
    try {
      const s3Key = this.generateS3Key(
          uploadDto.livestockPostId,
          file.originalname,
        ),
        mimeType = uploadDto.mimeType,
        uploadObject = {
          Bucket: this.s3Bucket,
          Key: s3Key,
          Body: file.buffer,
          ContentType: mimeType,
          Metadata: {
            'livestock-post-id': uploadDto.livestockPostId,
            'original-name': file.originalname,
          },
        },
        uploadCommand = new PutObjectCommand(uploadObject);
      await this.s3Client.send(uploadCommand);

      const {
          fileName,
          fileSizeBytes,
          livestockPostId,
          isMainFile,
          displayOrder,
        } = uploadDto,
        fileMetadata = await this.saveFileMetadata({
          fileName: fileName,
          fileSizeBytes: fileSizeBytes,
          mimeType: mimeType,
          livestockPostId: livestockPostId,
          s3Bucket: this.s3Bucket,
          s3Key,
          isMainFile: isMainFile || false,
          displayOrder: displayOrder || 0,
        });

      return fileMetadata;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new InternalServerErrorException(
        `Error al subir archivo: ${message}`,
      );
    }
  }

  async uploadBatch(
    files: Express.Multer.File[],
    batchDto: BatchUploadFileDto,
  ): Promise<UploadResponseDto> {
    try {
      const uploadedFiles: FileMetadata[] = [];
      const errors: string[] = [];

      for (let i = 0; i < files.length; i++) {
        try {
          const file = files[i];
          const fileConfig = batchDto.files[i];

          if (!fileConfig) {
            throw new BadRequestException(
              `Configuración de archivo faltante para el archivo en posición ${i}`,
            );
          }

          const s3Key = this.generateS3Key(
              batchDto.livestockPostId,
              file.originalname,
            ),
            uploadObject = {
              Bucket: this.s3Bucket,
              Key: s3Key,
              Body: file.buffer,
              ContentType: file.mimetype,
              Metadata: {
                'livestock-post-id': batchDto.livestockPostId,
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
              livestockPostId: batchDto.livestockPostId,
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
        `Error al subir lote de archivos: ${message}`,
      );
    }
  }

  async getDownloadUrl(
    fileId: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    try {
      const file = (await this.database.query(queries.getFileMetadata, [
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
        ? queries.getMainFileByLivestockPost
        : queries.getFilesByLivestockPost;

      const files: FileMetadata[] = (await this.database.query(query, [
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

  async deleteFile(fileId: string): Promise<UploadResponseDto> {
    try {
      const file: FileMetadata = (await this.database.query(
        queries.getFileMetadata,
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

      await this.database.query(queries.deleteFile, [fileId]);

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

  async deleteFiles(fileIds: string[]): Promise<UploadResponseDto> {
    try {
      const deletedFiles: string[] = [];
      const errors: string[] = [];

      for (const fileId of fileIds) {
        try {
          const file: FileMetadata = (await this.database.query(
            queries.getFileMetadata,
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

          await this.database.query(queries.deleteFile, [fileId]);
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
    fileData: UploadFileDto,
  ): Promise<FileMetadata> {
    const result = (await this.database.query(queries.insertLivestockPostFile, [
      fileData.fileName,
      fileData.fileSizeBytes,
      fileData.mimeType,
      fileData.livestockPostId,
      fileData.s3Bucket,
      fileData.s3Key,
      fileData.isMainFile,
      fileData.displayOrder,
    ])) as FileMetadata;

    console.log('Metadata guardada:', result);
    return result;
  }
}
