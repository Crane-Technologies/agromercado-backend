import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
} from './dto';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  createNotification(
    @Body() createNotificationDto: CreateNotificationRequestDto,
  ) {
    return this.notificationsService.createAndSend(createNotificationDto);
  }

  @Get('chats/:userId')
  getAllChatsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.notificationsService.getAllChatsByUser(userId, +limit, +offset);
  }
  @Get('chats/:userId/messages')
  getAllMessagesByChat(
    @Param('userId') userId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.notificationsService.getAllMessagesByChat(
      userId,
      +limit,
      +offset,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationRequestDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
