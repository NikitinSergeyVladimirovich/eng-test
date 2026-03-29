import { Injectable } from '@nestjs/common';

@Injectable()
export class AppConfigService {
  readonly databaseUrl: string;
  readonly jwtSecret: string;
  readonly jwtExpiresIn: string;
  readonly roundDurationSeconds: number;
  readonly cooldownDurationSeconds: number;
  readonly port: number;
  readonly cookieName: string;
  readonly nodeEnv: string;

  constructor() {
    this.databaseUrl = process.env.DATABASE_URL ?? '';
    this.jwtSecret = process.env.JWT_SECRET ?? 'change-me-in-production';
    this.jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
    this.roundDurationSeconds = Number(process.env.ROUND_DURATION ?? '60');
    this.cooldownDurationSeconds = Number(process.env.COOLDOWN_DURATION ?? '30');
    this.port = Number(process.env.PORT ?? '3000');
    this.cookieName = process.env.AUTH_COOKIE_NAME ?? 'access_token';
    this.nodeEnv = process.env.NODE_ENV ?? 'development';
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }
}
