import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from './config/config.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { RoundsModule } from './modules/rounds/rounds.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [ConfigModule, PrismaModule, AuthModule, RoundsModule],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
