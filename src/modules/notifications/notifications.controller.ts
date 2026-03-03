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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import {
  CreateNotificationRequestDto,
  UpdateNotificationRequestDto,
} from './dto';

@ApiTags('Notificaciones')
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  @ApiOperation({ summary: 'Crear y enviar notificación', description: 'Crea una nueva notificación de compra y la envía al destinatario' })
  @ApiResponse({ status: 201, description: 'Notificación creada y enviada exitosamente' })
  @ApiResponse({ status: 400, description: 'Datos inválidos' })
  createNotification(
    @Body() createNotificationDto: CreateNotificationRequestDto,
  ) {
    return this.notificationsService.createAndSend(createNotificationDto);
  }

  @Get('chats/:userId')
  @ApiOperation({ summary: 'Obtener chats del usuario', description: 'Retorna todos los chats/notificaciones del usuario con paginación' })
  @ApiParam({ name: 'userId', description: 'UUID del usuario', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de resultados', example: 50 })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de resultados a omitir', example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de chats del usuario' })
  getAllChatsByUser(
    @Param('userId') userId: string,
    @Query('limit') limit = '50',
    @Query('offset') offset = '0',
  ) {
    return this.notificationsService.getAllChatsByUser(userId, +limit, +offset);
  }

  @Get('chats/:userId/messages')
  @ApiOperation({ summary: 'Obtener mensajes de un chat', description: 'Retorna todos los mensajes de un chat específico con paginación' })
  @ApiParam({ name: 'userId', description: 'UUID del usuario o del chat', example: '550e8400-e29b-41d4-a716-446655440000' })
  @ApiQuery({ name: 'limit', required: false, description: 'Número máximo de resultados', example: 50 })
  @ApiQuery({ name: 'offset', required: false, description: 'Número de resultados a omitir', example: 0 })
  @ApiResponse({ status: 200, description: 'Lista de mensajes del chat' })
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
  @ApiOperation({ summary: 'Obtener notificación por ID' })
  @ApiParam({ name: 'id', description: 'ID numérico de la notificación', example: 1 })
  @ApiResponse({ status: 200, description: 'Datos de la notificación' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar notificación', description: 'Actualiza los campos de una notificación (ej. marcar como leída)' })
  @ApiParam({ name: 'id', description: 'ID numérico de la notificación', example: 1 })
  @ApiResponse({ status: 200, description: 'Notificación actualizada exitosamente' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  update(
    @Param('id') id: string,
    @Body() updateNotificationDto: UpdateNotificationRequestDto,
  ) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar notificación' })
  @ApiParam({ name: 'id', description: 'ID numérico de la notificación', example: 1 })
  @ApiResponse({ status: 200, description: 'Notificación eliminada exitosamente' })
  @ApiResponse({ status: 404, description: 'Notificación no encontrada' })
  remove(@Param('id') id: string) {
    return this.notificationsService.remove(+id);
  }
}
