import { Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from './auth.service';
import { AppConfigService } from '../../config/app-config.service';
declare const JwtStrategy_base: new (...args: any[]) => Strategy;
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly authService;
    private readonly appConfig;
    constructor(authService: AuthService, appConfig: AppConfigService);
    validate(payload: JwtPayload): Promise<{
        userId: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
export {};
