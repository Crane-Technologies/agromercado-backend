import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Server, Socket } from 'socket.io';
import { Injectable } from '@nestjs/common';

@WebSocketGateway({
  cors: { origin: '*' },
})
@Injectable()
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        socket.disconnect(true);
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_ACCESS_SECRET'),
      });

      const userId = payload.sub;
      await socket.join(userId);
      socket.data.userId = userId;
    } catch (error) {
      socket.disconnect(true);
      if (error instanceof Error) {
        console.error('WebSocket connection error:', error.message);
      } else {
        console.error('WebSocket connection error:', error);
      }
    }
  }

  sendMessage(userId: string, notification: any): boolean {
    try {
      this.server.to(userId).emit('sendMessage', notification);
      return true;
    } catch (error) {
      console.error('Error sending notification:', error);
      return false;
    }
  }

  @SubscribeMessage('sendMessage')
  handleMessage(
    @MessageBody() data: { toUserId: string; message: string },
    @ConnectedSocket() socket: Socket,
  ) {
    this.server.to(data.toUserId).emit('receiveMessage', {
      from: socket.data.userId,
      message: data.message,
    });
  }
}
