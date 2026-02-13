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
    dto.message = dto.message ?? 'Hola, estoy interesado en tu publicación. ';

    const purchaseNotificationParams = [
      dto.livestockPostId,
      dto.sentBy,
      dto.message,
      dto.isRead,
    ];

    await this.db.query(
      queries.purchaseNotification.createPurchaseNotification,
      purchaseNotificationParams,
    );
  }
}
