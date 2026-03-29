import { Body, Controller, Get, Post, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { AppConfigService } from '../../config/app-config.service';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly appConfig: AppConfigService,
  ) {}

  @Public()
  @Post()
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.authService.validateCredentials(body.username, body.password);
    const token = this.authService.signAccessToken(user);

    res.cookie(this.appConfig.cookieName, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: this.appConfig.isProduction,
      path: '/',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      access_token: token,
      user: { login: user.login, role: user.role },
    };
  }

  @Get('me')
  async me(@CurrentUser() user: AuthUser | undefined) {
    if (!user) {
      throw new UnauthorizedException();
    }
    return { user: { login: user.username, role: user.role } };
  }

  @Public()
  @Post('logout')
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie(this.appConfig.cookieName, { path: '/' });
    return { ok: true };
  }
}
