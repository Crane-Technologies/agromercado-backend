import { Injectable } from '@nestjs/common';
import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
} from './dto';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsRepository } from './notifications.repository';
import { GetAllChatsResponseDto } from './dto/response/get-all-chats.response.dto';

@Injectable()
export class NotificationsService {
  constructor(
    private notificationRepository: NotificationsRepository,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createAndSend(createNotificationDto: CreateNotificationRequestDto) {
    try {
      const sendResult = this.notificationsGateway.sendMessage(
        createNotificationDto.sentBy, //TODO: cambiar por el destinatario real
        createNotificationDto,
      );

      if (sendResult) {
        const notification =
          await this.notificationRepository.createPurchaseNotification(
            createNotificationDto,
          );
        return notification;
      } else {
        throw new Error('WebSocket delivery failed');
      }
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to send and create notification',
      );
    }
  }

  async getAllChatsByUser(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<GetAllChatsResponseDto> {
    try {
      const chats = await this.notificationRepository.getAllChatsByUser(
        userId,
        limit,
        offset,
      );

      const unreadCount = chats.reduce(
        (count, chat) => count + (chat.is_read === false ? 1 : 0),
        0,
      );

      const response = new GetAllChatsResponseDto();
      response.chats = chats;
      response.unreadCount = unreadCount;

      return response;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to retrieve all chats',
      );
    }
  }

  async getAllMessagesByChat(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<any> {
    try {
      return await this.notificationRepository.getAllMessagesByChat(
        userId,
        limit,
        offset,
      );
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve unread notifications',
      );
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationRequestDto) {
    return `This action updates a #${id} notification`;
  }

  remove(id: number) {
    return `This action removes a #${id} notification`;
  }
}
