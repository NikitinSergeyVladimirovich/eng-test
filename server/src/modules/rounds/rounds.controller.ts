import { BadRequestException, Body, Controller, Get, Param, Post } from '@nestjs/common';
import { RoundsService } from './rounds.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/types/auth-user';
import { TapDto } from './dto/tap.dto';

@Controller()
export class RoundsController {
  constructor(private readonly roundsService: RoundsService) {}

  @Get('rounds')
  async listRounds() {
    return this.roundsService.listUpcomingAndActive();
  }

  @Get('round/:uuid')
  async getRound(@Param('uuid') uuid: string, @CurrentUser() user: AuthUser) {
    return this.roundsService.getRoundDetail(uuid, user);
  }

  @Post('round')
  async createRound(@CurrentUser() user: AuthUser) {
    return this.roundsService.createRound(user);
  }

  @Post('tap')
  async tap(@Body() body: TapDto, @CurrentUser() user: AuthUser) {
    if (!body.uuid?.trim()) {
      throw new BadRequestException('uuid is required');
    }
    const result = await this.roundsService.tap(body.uuid, user);
    return { message: 'tap performed', score: result.score };
  }
}
