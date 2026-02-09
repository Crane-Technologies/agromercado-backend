export class UploadFileDto {
  fileName!: string;
  fileSizeBytes!: number;
  mimeType!: string;
  s3Bucket!: string;
  s3Key!: string;
  livestockPostId!: string;
  isMainFile?: boolean;
  displayOrder?: number;
}
