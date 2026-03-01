import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsRepository } from './notifications.repository';

@Module({
  imports: [JwtModule.register({}), ConfigModule],
  providers: [
    NotificationsService,
    NotificationsGateway,
    NotificationsRepository,
  ],
  exports: [NotificationsService, NotificationsRepository],
})
export class NotificationsModule {}
