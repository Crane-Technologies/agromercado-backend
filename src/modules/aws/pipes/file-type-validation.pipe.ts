import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  private readonly allowedImageMimeTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly allowedVideoMimeTypes = ['video/mp4', 'video/webm'];

  transform(value: any): any {
    if (!value || typeof value !== 'object' || !('fileType' in value)) {
      return value;
    }

    return value;
  }

  validateFileType(
    file: Express.Multer.File,
    fileType: 'image' | 'video',
  ): void {
    const allowedMimeTypes =
      fileType === 'image'
        ? this.allowedImageMimeTypes
        : this.allowedVideoMimeTypes;

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Se esperaba ${fileType}, recibido: ${file.mimetype}`,
      );
    }
  }
}
