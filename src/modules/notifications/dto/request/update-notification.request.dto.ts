import { PartialType } from '@nestjs/mapped-types';
import { CreateNotificationRequestDto } from './create-notification.request.dto';

export class UpdateNotificationRequestDto extends PartialType(
  CreateNotificationRequestDto,
) {}
