import { ApiProperty } from '@nestjs/swagger';

export class FileMetadata {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  app_file_id!: string;

  @ApiProperty({ example: 'foto-ganado.jpg' })
  app_file_name!: string;

  @ApiProperty({ example: 204800 })
  app_file_size_bytes!: number;

  @ApiProperty({ example: 'image/jpeg' })
  mime_type!: string;

  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440001' })
  livestock_post_id!: string;

  @ApiProperty({ example: 'agrodil-bucket' })
  s3_bucket!: string;

  @ApiProperty({ example: 'posts/550e8400/foto-ganado.jpg' })
  s3_key!: string;

  @ApiProperty({ example: true })
  is_main_file!: boolean;

  @ApiProperty({ example: 1 })
  display_order!: number;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  created_at!: Date;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  updated_at!: Date;
}
