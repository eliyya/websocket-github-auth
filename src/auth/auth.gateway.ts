import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

type SocketClient = Socket<EventsEmitClientMap, EventsListenerClientMap>
interface User {
    id: string
    login: string
}

export interface GithubSuccesResponse {
    login: string
    id: number
    node_id: string
    avatar_url: string
    gravatar_id: string
    url: string
    html_url: string
    followers_url: string
    following_url: string
    gists_url: string
    starred_url: string
    subscriptions_url: string
    organizations_url: string
    repos_url: string
    events_url: string
    received_events_url: string
    type: string
    user_view_type: string
    site_admin: boolean
    name: string
    company: any
    blog: string
    location: string
    email: any
    hireable: any
    bio: string
    twitter_username: string
    public_repos: number
    public_gists: number
    followers: number
    following: number
    created_at: string
    updated_at: string
}

export interface Message {
    id: string
    username: string
    avatar?: string
    content: string
    createdAt: string
}

interface EventsListenerClientMap {
    // [event: string]: (...args: any[]) => void
    authSuccess: (data: { message: string; user: GithubSuccesResponse }) => any
    authError: (data: { message: string }) => any
    message(data: { username: string; message: string }): any
}
interface EventsEmitClientMap {
    // [event: string]: (...args: any[]) => void
    auth: (token: string) => any
    sendMessage: (message: Message) => any
}
interface EventsListenerMap {
    // [event: string]: (...args: any[]) => void
    t: (d: any) => any
}
interface EventsEmitMap {
    // [event: string]: (...args: any[]) => void
    userConnected: (data: { username: string }) => any
}

@WebSocketGateway({
    cors: {
        origin: '*',
    },
})
export class AuthGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server<EventsListenerMap, EventsEmitMap>
    private users: Map<string, User> = new Map()

    handleConnection(client: SocketClient) {
        console.log(`Client connected: ${client.id}`)
    }

    handleDisconnect(client: SocketClient) {
        console.log(`Client disconnected: ${client.id}`)
        this.users.delete(client.id)
    }

    @SubscribeMessage('auth')
    async handleAuth(client: SocketClient, token: string) {
        console.log(`Client trying autenicate: ${client.id}`)

        try {
            // Validar el token de GitHub utilizando fetch
            const response = await fetch('https://api.github.com/user', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            })

            // Verificar si la respuesta es exitosa
            if (!response.ok) {
                throw new Error('Authentication failed')
            }

            const userData = await response.json()

            // Agregar el usuario a la lista de usuarios conectados
            this.users.set(client.id, { id: client.id, login: userData.login })

            // Informar al usuario que ha sido autenticado
            client.emit('authSuccess', {
                message: 'Authenticated successfully',
                user: userData,
            })
            console.log(`Client autenicatd: ${client.id}`)
            // Notificar a todos los usuarios sobre la nueva conexión
            this.server.emit('userConnected', { username: userData.login })
        } catch (error) {
            console.error('Authentication error:', error)
            client.emit('authError', { message: 'Authentication failed' })
        }
    }

    @SubscribeMessage('sendMessage')
    handleMessage(client: SocketClient, message: string) {
        const user = this.users.get(client.id)
        console.log({ username: user.login, message })
        if (user) {
            // Enviar el mensaje a todos los usuarios conectados excepto al emisor
            client.broadcast.emit('message', { username: user.login, message })
        }
    }
}
