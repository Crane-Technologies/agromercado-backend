import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsString,
  IsUUID,
} from 'class-validator';

class ChatDto {
  @IsUUID()
  purchaseNotificationId!: string;

  @IsUUID()
  sentBy!: string;

  @IsUUID()
  livestockPostId!: string;

  @IsInt()
  purchaseNotificationTypeId!: number;

  @IsString()
  message!: string;

  @IsBoolean()
  isRead!: boolean;

  @IsDateString()
  createdAt!: string;

  @IsString()
  senderName!: string;

  @IsString()
  livestockPostName!: string;

  @IsString()
  notificationTypeName!: string;
}

export class GetAllChatsResponseDto {
  chats!: ChatDto[];
  @IsInt()
  unreadCount!: number;
}
