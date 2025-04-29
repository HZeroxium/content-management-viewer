import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  path: '/ws/content', // custom path (optional)
  cors: { origin: '*' }, // tighten in prod
})
export class ContentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ContentGateway.name);

  afterInit(server: Server) {
    this.logger.log('ContentGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  /**
   * Broadcast updated content to all clients.
   * If you want rooms, use this.server.to(room).emit(...)
   */
  broadcastContentUpdate(content: any) {
    this.server.emit('contentUpdated', content);
  }
}
