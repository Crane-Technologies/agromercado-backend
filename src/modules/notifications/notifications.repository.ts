import { Injectable, Inject } from '@nestjs/common';
import Database from '@crane-technologies/database';
import { DATABASE } from '../database/database.provider';
import { queries } from '../database/queries';
import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
} from './dto';

@Injectable()
export class NotificationsRepository {
  constructor(
    @Inject(DATABASE)
    private readonly db: Database,
  ) {}

  async createPurchaseNotification(
    dto: CreateNotificationRequestDto,
  ): Promise<void> {
    try {
      dto.message = dto.message ?? 'Hola, estoy interesado en tu publicación. ';

      const purchaseNotificationParams = [
        dto.sentBy,
        dto.livestockPostId,
        dto.purchaseNotificationTypeId,
        dto.message,
      ];

      await this.db.query(
        queries.purchaseNotification.createPurchaseNotification,
        purchaseNotificationParams,
      );
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to create purchase notification',
      );
    }
  }

  async getAllChatsByUser(userId: string, limit: number, offset: number) {
    try {
      const result = await this.db.query(
        queries.purchaseNotification.getAllChatsByUser,
        [userId, limit, offset],
      );
      return result.rows;
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Failed to retrieve all chats',
      );
    }
  }

  async getAllMessagesByChat(
    livestockPostId: string,
    limit: number,
    offset: number,
  ) {
    try {
      const result = await this.db.query(
        queries.purchaseNotification.getAllMessagesByChat,
        [livestockPostId, limit, offset],
      );
      return result.rows;
    } catch (error) {
      throw new Error(
        error instanceof Error
          ? error.message
          : 'Failed to retrieve messages for chat',
      );
    }
  }
}
