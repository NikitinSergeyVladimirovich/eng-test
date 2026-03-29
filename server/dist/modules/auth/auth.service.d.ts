import { JwtService } from '@nestjs/jwt';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export type SafeUser = Pick<User, 'id' | 'login' | 'role'>;
export interface JwtPayload {
    sub: string;
    username: string;
    role: UserRole;
}
export declare class AuthService {
    private readonly prisma;
    private readonly jwtService;
    constructor(prisma: PrismaService, jwtService: JwtService);
    validateCredentials(login: string, password: string): Promise<SafeUser>;
    signAccessToken(user: SafeUser): string;
    getUserById(id: string): Promise<SafeUser | null>;
}
