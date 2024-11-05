// src/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { WSGateway } from './ws.gateway'

@Module({
    providers: [WSGateway],
})
export class WSModule {}
