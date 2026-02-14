import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  private readonly maxFileSize = 100 * 1024 * 1024;

  transform(value: any): Express.Multer.File {
    if (!value || typeof value !== 'object') {
      throw new BadRequestException('No se proporcionó archivo');
    }

    const file = value as Express.Multer.File;

    if (!file.size || !file.mimetype) {
      throw new BadRequestException('Archivo inválido');
    }

    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `El archivo excede el tamaño máximo permitido (${this.maxFileSize / 1024 / 1024}MB)`,
      );
    }

    return file;
  }
}
