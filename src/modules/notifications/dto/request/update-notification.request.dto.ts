import { PartialType } from '@nestjs/swagger';
import { CreateNotificationRequestDto } from './create-notification.request.dto';

export class UpdateNotificationRequestDto extends PartialType(
  CreateNotificationRequestDto,
) {}
