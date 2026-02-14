import { FileMetadata } from './file-metadata.response.dto';

export class UploadFilesResponseDto {
  success!: boolean;
  message!: string;
  file?: FileMetadata;
  files?: FileMetadata[];
  error?: string;
}
