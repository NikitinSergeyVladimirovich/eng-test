import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { pointsDeltaForNextTap, pointsFromTaps } from '../../common/utils/scoring';
import { AuthUser } from '../../common/types/auth-user';

export interface RoundDto {
  uuid: string;
  start_datetime: string;
  end_datetime: string;
  status: 'cooldown' | 'active' | 'finished';
}

function roundStatus(
  now: Date,
  startsAt: Date,
  endsAt: Date,
): 'cooldown' | 'active' | 'finished' {
  if (now < startsAt) {
    return 'cooldown';
  }
  if (now >= endsAt) {
    return 'finished';
  }
  return 'active';
}

function toRoundDto(round: { id: string; startsAt: Date; endsAt: Date }): RoundDto {
  const now = new Date();
  return {
    uuid: round.id,
    start_datetime: round.startsAt.toISOString(),
    end_datetime: round.endsAt.toISOString(),
    status: roundStatus(now, round.startsAt, round.endsAt),
  };
}

@Injectable()
export class RoundsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly appConfig: AppConfigService,
  ) {}

  async listUpcomingAndActive(): Promise<RoundDto[]> {
    const now = new Date();
    const rows = await this.prisma.round.findMany({
      where: { endsAt: { gt: now } },
      orderBy: { startsAt: 'asc' },
    });
    return rows.map(toRoundDto);
  }

  async createRound(actor: AuthUser): Promise<RoundDto> {
    if (actor.role !== UserRole.admin) {
      throw new ForbiddenException('Only admin can create rounds');
    }

    const now = Date.now();
    const cooldownMs = this.appConfig.cooldownDurationSeconds * 1000;
    const durationMs = this.appConfig.roundDurationSeconds * 1000;

    const startsAt = new Date(now + cooldownMs);
    const endsAt = new Date(startsAt.getTime() + durationMs);

    const round = await this.prisma.round.create({
      data: {
        startsAt,
        endsAt,
        totalPoints: 0,
      },
    });

    return toRoundDto(round);
  }

  async getRoundDetail(roundId: string, viewer: AuthUser): Promise<{
    round: RoundDto;
    totalScore?: number;
    bestPlayer?: { username: string; score: number } | null;
    currentUserScore?: number;
  }> {
    const round = await this.prisma.round.findUnique({ where: { id: roundId } });
    if (!round) {
      throw new NotFoundException('Round not found');
    }

    const dto = toRoundDto(round);
    const now = new Date();

    const participation = await this.prisma.roundParticipation.findUnique({
      where: {
        userId_roundId: { userId: viewer.userId, roundId },
      },
    });

    const taps = participation?.taps ?? 0;
    const currentUserScore =
      viewer.role === UserRole.nikita ? 0 : pointsFromTaps(taps);

    if (dto.status === 'finished' || now >= round.endsAt) {
      const summary = await this.computeRoundSummary(roundId);
      return {
        round: { ...dto, status: 'finished' },
        totalScore: summary.totalScore,
        bestPlayer: summary.bestPlayer,
        currentUserScore,
      };
    }

    return {
      round: dto,
      currentUserScore,
    };
  }

  private async computeRoundSummary(roundId: string): Promise<{
    totalScore: number;
    bestPlayer: { username: string; score: number } | null;
  }> {
    const round = await this.prisma.round.findUnique({
      where: { id: roundId },
    });
    if (!round) {
      return { totalScore: 0, bestPlayer: null };
    }

    const participations = await this.prisma.roundParticipation.findMany({
      where: { roundId },
      include: { user: true },
    });

    let best: { username: string; score: number } | null = null;

    for (const p of participations) {
      if (p.user.role === UserRole.nikita) {
        continue;
      }
      const score = pointsFromTaps(p.taps);
      if (!best || score > best.score) {
        best = { username: p.user.login, score };
      }
    }

    return {
      totalScore: round.totalPoints,
      bestPlayer: best,
    };
  }

  async tap(roundId: string, user: AuthUser): Promise<{ score: number }> {
    if (user.role === UserRole.nikita) {
      return { score: 0 };
    }

    return this.prisma.$transaction(
      async (tx) => {
        const round = await tx.round.findUnique({ where: { id: roundId } });
        if (!round) {
          throw new NotFoundException('Round not found');
        }

        const now = new Date();
        if (now < round.startsAt || now >= round.endsAt) {
          throw new BadRequestException('Round is not active');
        }

        const existing = await tx.roundParticipation.findUnique({
          where: {
            userId_roundId: { userId: user.userId, roundId },
          },
        });

        const prevTaps = existing?.taps ?? 0;
        const delta = pointsDeltaForNextTap(prevTaps);

        await tx.roundParticipation.upsert({
          where: {
            userId_roundId: { userId: user.userId, roundId },
          },
          create: {
            userId: user.userId,
            roundId,
            taps: 1,
          },
          update: {
            taps: { increment: 1 },
          },
        });

        await tx.round.update({
          where: { id: roundId },
          data: {
            totalPoints: { increment: delta },
          },
        });

        const newScore = pointsFromTaps(prevTaps + 1);
        return { score: newScore };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }
}
