export class BatchFileItem {
  fileName!: string;
  fileSizeBytes!: number;
  mimeType!: string;
  isMainFile?: boolean;
  displayOrder?: number;
}
