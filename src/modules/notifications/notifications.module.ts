import { Module } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsRepository } from './notifications.repository';

@Module({
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsRepository,
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
