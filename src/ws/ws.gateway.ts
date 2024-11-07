import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import {
    EventsEmitMap,
    EventsListenerMap,
    Message,
    SocketClient,
    User,
} from './types'

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class WSGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server<EventsListenerMap, EventsEmitMap>
    private users: Map<string, User> = new Map()

    handleConnection(client: SocketClient) {
        console.log(`Client connected: ${client.id}`)
        setTimeout(
            () => this.users.get(client.id) || client.disconnect(true),
            10_000,
        )
    }

    handleDisconnect(client: SocketClient) {
        console.log(`Client disconnected: ${client.id}`)
        this.users.delete(client.id)
    }

    @SubscribeMessage('auth')
    async handleAuth(
        @ConnectedSocket() client: SocketClient,
        @MessageBody() username: string,
    ) {
        console.log(`Client trying autenicate: ${client.id}`, username)

        try {
            fetch('https://api.github.com/users/' + username, {
                headers: {
                    'Content-Type': 'application/json', // Tipo de contenido
                },
            })
                .then(r => r.json())
                .then(({ avatar_url }) => {
                    this.users.set(client.id, {
                        id: client.id,
                        login: username,
                        avatar: avatar_url,
                    })
                })
                .catch(() => {
                    this.users.set(client.id, {
                        id: client.id,
                        login: username,
                    })
                })
            // Agregar el usuario a la lista de usuarios conectados

            // Informar al usuario que ha sido autenticado
            client.emit('authSuccess', {
                message: 'Authenticated successfully',
                user: this.users.get(client.id),
            })
            console.log(`Client autenicatd: ${client.id}`)
            // Notificar a todos los usuarios sobre la nueva conexión
            this.server.emit('userConnected', { username })
        } catch (error) {
            console.error('Authentication error:', error)
            client.emit('authError', { message: 'Authentication failed' })
        }
    }

    @SubscribeMessage('sendMessage')
    handleMessage(
        @ConnectedSocket() client: SocketClient,
        @MessageBody() message: Message,
    ) {
        const user = this.users.get(client.id)
        console.log({ username: user.login, message })
        if (user) {
            // Enviar el mensaje a todos los usuarios conectados excepto al emisor
            this.server.emit('message', {
                ...message,
                avatar: user.avatar,
            })
        }
    }
}
