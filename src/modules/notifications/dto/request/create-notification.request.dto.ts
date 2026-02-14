import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateNotificationRequestDto {
  @IsUUID()
  livestockPostId!: string;

  @IsUUID()
  sentBy!: string;

  @IsInt()
  purchaseNotificationTypeId!: number;

  @IsString()
  message!: string;

  @IsBoolean()
  @IsOptional()
  isRead?: boolean;
}
