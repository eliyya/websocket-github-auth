import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthGateway } from '@/auth/auth.gateway'
import { AuthModule } from '@/auth/auth.module'
import { HealthModule } from '@/health/health.module'

@Module({
    imports: [AuthModule, HealthModule],
    controllers: [AppController],
    providers: [AppService, AuthGateway],
})
export class AppModule {}
