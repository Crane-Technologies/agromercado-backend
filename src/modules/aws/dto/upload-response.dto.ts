import { FileMetadata } from './file-metadata-response.dto';

export class UploadResponseDto {
  success!: boolean;
  message!: string;
  file?: FileMetadata;
  files?: FileMetadata[];
  error?: string;
}
