// src/auth/auth.gateway.ts
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server } from 'socket.io';

interface User {
  id: string;
  login: string;
}

@WebSocketGateway({ cors: true })
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private users: Map<string, User> = new Map();

  handleConnection(client: any) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: any) {
    console.log(`Client disconnected: ${client.id}`);
    this.users.delete(client.id);
  }

  @SubscribeMessage('auth')
  async handleAuth(client: any, token: string) {
    try {
      // Validar el token de GitHub utilizando fetch
      const response = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Verificar si la respuesta es exitosa
      if (!response.ok) {
        throw new Error('Authentication failed');
      }

      const userData = await response.json();

      // Agregar el usuario a la lista de usuarios conectados
      this.users.set(client.id, { id: client.id, login: userData.login });

      // Informar al usuario que ha sido autenticado
      client.emit('authSuccess', {
        message: 'Authenticated successfully',
        user: userData,
      });

      // Notificar a todos los usuarios sobre la nueva conexión
      this.server.emit('userConnected', { username: userData.login });
    } catch (error) {
      console.error('Authentication error:', error);
      client.emit('authError', { message: 'Authentication failed' });
    }
  }

  @SubscribeMessage('sendMessage')
  handleMessage(client: any, message: string) {
    const user = this.users.get(client.id);
    if (user) {
      // Enviar el mensaje a todos los usuarios conectados excepto al emisor
      client.broadcast.emit('message', { username: user.login, message });
    }
  }
}
