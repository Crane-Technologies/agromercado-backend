import { BatchFileItem } from './batch-file-item.dto';

export class BatchUploadFileDto {
  livestockPostId!: string;
  s3Bucket!: string;
  s3Key!: string;
  files!: BatchFileItem[];
}
