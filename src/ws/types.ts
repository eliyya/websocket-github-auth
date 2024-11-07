import { Socket } from 'socket.io'

export type SocketClient = Socket<EventsEmitClientMap, EventsListenerClientMap>
export interface User {
    id: string
    login: string
    avatar?: string
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

export interface EventsListenerClientMap {
    // [event: string]: (...args: any[]) => void
    authSuccess: (data: { message: string; user: User }) => any
    authError: (data: { message: string }) => any
    message(data: Message): any
}
export interface EventsEmitClientMap {
    // [event: string]: (...args: any[]) => void
    auth: (username: string) => any
    sendMessage: (message: Message) => any
}
export interface EventsListenerMap {
    // [event: string]: (...args: any[]) => void
    t: (d: any) => any
}
export interface EventsEmitMap {
    // [event: string]: (...args: any[]) => void
    userConnected: (data: { username: string }) => any

    message(data: Message): any
}
