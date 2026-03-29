import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { resolveRoleForNewUser } from '../../common/utils/role-from-login';

export type SafeUser = Pick<User, 'id' | 'login' | 'role'>;

export interface JwtPayload {
  sub: string;
  username: string;
  role: UserRole;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async validateCredentials(login: string, password: string): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({ where: { login } });

    if (existing) {
      const ok = await bcrypt.compare(password, existing.passwordHash);
      if (!ok) {
        throw new UnauthorizedException('Invalid credentials');
      }
      return { id: existing.id, login: existing.login, role: existing.role };
    }

    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    const role = resolveRoleForNewUser(login);

    const created = await this.prisma.user.create({
      data: { login, passwordHash, role },
      select: { id: true, login: true, role: true },
    });

    return created;
  }

  signAccessToken(user: SafeUser): string {
    const payload: JwtPayload = {
      sub: user.id,
      username: user.login,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }

  async getUserById(id: string): Promise<SafeUser | null> {
    return this.prisma.user.findUnique({
      where: { id },
      select: { id: true, login: true, role: true },
    });
  }
}
