// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { AuthGateway } from './auth.gateway';

@Module({
  providers: [AuthGateway],
})
export class AuthModule {}
