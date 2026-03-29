import { Response } from 'express';
import { AuthService } from './auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { LoginDto } from './dto/login.dto';
import { AuthUser } from '../../common/types/auth-user';
export declare class AuthController {
    private readonly authService;
    private readonly appConfig;
    constructor(authService: AuthService, appConfig: AppConfigService);
    login(body: LoginDto, res: Response): Promise<{
        access_token: string;
        user: {
            login: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    me(user: AuthUser | undefined): Promise<{
        user: {
            login: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    }>;
    logout(res: Response): Promise<{
        ok: boolean;
    }>;
}
