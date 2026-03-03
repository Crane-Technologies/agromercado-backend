import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @ApiProperty({ example: '550e8400-e29b-41d4-a716-446655440000' })
  @IsUUID()
  userId!: string;

  @ApiProperty({ example: '482910' })
  @IsString()
  @Length(6, 6)
  code!: string;
}
