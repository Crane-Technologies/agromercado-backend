import { Injectable } from '@nestjs/common';
import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
} from './dto';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsRepository } from './notifications.repository';

@Injectable()
export class NotificationsService {
  constructor(
    private notificationRepository: NotificationsRepository,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async createAndSend(createNotificationDto: CreateNotificationRequestDto) {
    try {
      const notification =
        await this.notificationRepository.createPurchaseNotification(
          createNotificationDto,
        );

      this.notificationsGateway.sendNotificationToUser(
        createNotificationDto.sentBy,
        notification,
      );

      return notification;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to create and send notification',
      );
    }
  }

  findAll() {
    return `This action returns all notifications`;
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
