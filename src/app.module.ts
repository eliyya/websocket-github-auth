import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { WSGateway } from '@/ws/ws.gateway'
import { WSModule } from '@/ws/ws.module'
import { HealthModule } from '@/health/health.module'
import { AuthModule } from './auth/auth.module';

@Module({
    imports: [WSModule, HealthModule, AuthModule],
    controllers: [AppController],
    providers: [AppService, WSGateway],
})
export class AppModule {}
