import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
  path: '/ws/content',
  cors: { origin: '*' },
})
export class ContentGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(ContentGateway.name);
  private watchingClients = new Map<string, Set<string>>();

  afterInit(server: Server) {
    this.logger.log('ContentGateway initialized with path: /ws/content');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    // Debug connection info
    this.logger.log(
      `Connection headers: ${JSON.stringify(client.handshake.headers)}`,
    );
    this.logger.log(
      `Connection query: ${JSON.stringify(client.handshake.query)}`,
    );

    // Send a welcome event to the client
    client.emit('welcome', { message: 'Connected to ContentGateway' });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up any watching clients
    this.watchingClients.forEach((clients, contentId) => {
      if (clients.has(client.id)) {
        clients.delete(client.id);
        this.logger.log(
          `Client ${client.id} stopped watching content ${contentId}`,
        );
      }
    });
  }

  @SubscribeMessage('watchContent')
  handleWatchContent(client: Socket, payload: { contentId: string }) {
    const { contentId } = payload;
    if (!contentId) return;

    // Initialize set if not exists
    if (!this.watchingClients.has(contentId)) {
      this.watchingClients.set(contentId, new Set());
    }

    // Add client to watchlist
    this.watchingClients.get(contentId)?.add(client.id);
    this.logger.log(
      `Client ${client.id} started watching content ${contentId}`,
    );

    // Join a room for this content
    client.join(`content:${contentId}`);
  }

  @SubscribeMessage('unwatchContent')
  handleUnwatchContent(client: Socket, payload: { contentId: string }) {
    const { contentId } = payload;
    if (!contentId) return;

    // Remove client from watchlist
    this.watchingClients.get(contentId)?.delete(client.id);
    this.logger.log(
      `Client ${client.id} stopped watching content ${contentId}`,
    );

    // Leave the room
    client.leave(`content:${contentId}`);
  }

  /**
   * Broadcast updated content to all clients.
   * Will send to all clients or to specific content room if content has id
   */
  broadcastContentUpdate(content: any) {
    this.logger.log(`Broadcasting content update: ${JSON.stringify(content)}`);

    if (content?.id) {
      // Emit to specific content room if id is provided
      this.server.to(`content:${content.id}`).emit('contentUpdated', content);
      this.logger.log(`Emitted to room content:${content.id}`);
    } else {
      // Broadcast to all if no specific id
      this.server.emit('contentUpdated', content);
      this.logger.log('Emitted to all clients');
    }
  }
}
