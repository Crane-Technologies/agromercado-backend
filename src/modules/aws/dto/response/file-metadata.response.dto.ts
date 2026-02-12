export class FileMetadata {
  app_file_id!: string;
  app_file_name!: string;
  app_file_size_bytes!: number;
  mime_type!: string;
  livestock_post_id!: string;
  s3_bucket!: string;
  s3_key!: string;
  is_main_file!: boolean;
  display_order!: number;
  created_at!: Date;
  updated_at!: Date;
}
