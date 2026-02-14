import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FilesValidationPipe implements PipeTransform {
  private readonly maxFileSize = 100 * 1024 * 1024; // 100MB
  private readonly maxFilesCount = 10;

  transform(value: any): Express.Multer.File[] {
    const files = value as Express.Multer.File[];

    if (!files || files.length === 0) {
      throw new BadRequestException('No se proporcionaron archivos');
    }

    if (files.length > this.maxFilesCount) {
      throw new BadRequestException(
        `Se pueden subir máximo ${this.maxFilesCount} archivos a la vez`,
      );
    }

    files.forEach((file, index) => {
      if (!file) {
        throw new BadRequestException(
          `Archivo en posición ${index} es inválido`,
        );
      }

      if (!file.size || !file.mimetype) {
        throw new BadRequestException(
          `Archivo en posición ${index} es inválido`,
        );
      }

      if (file.size > this.maxFileSize) {
        throw new BadRequestException(
          `El archivo "${file.originalname}" excede el tamaño máximo permitido (${this.maxFileSize / 1024 / 1024}MB)`,
        );
      }
    });

    return files;
  }
}
