import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class NotificationsGateway {
  @WebSocketServer()
  server!: Server;

  // Enviar notificación a un usuario específico
  sendNotificationToUser(userId: string, notification: any) {
    this.server.to(userId).emit('notification', notification);
  }

  // Escuchar cuando un cliente se conecta y unirse a una "room" por userId
  async handleConnection(socket: Socket) {
    const userId = socket.handshake.query.userId as string;
    if (userId) {
      await socket.join(userId);
    }
  }

  // Ejemplo: recibir mensajes de chat
  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { toUserId: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    // Emitir el mensaje al destinatario
    this.server.to(data.toUserId).emit('receiveMessage', {
      from: socket.handshake.query.userId,
      message: data.message,
    });
  }
}
