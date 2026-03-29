import { PrismaService } from '../../prisma/prisma.service';
import { AppConfigService } from '../../config/app-config.service';
import { AuthUser } from '../../common/types/auth-user';
export interface RoundDto {
    uuid: string;
    start_datetime: string;
    end_datetime: string;
    status: 'cooldown' | 'active' | 'finished';
}
export declare class RoundsService {
    private readonly prisma;
    private readonly appConfig;
    constructor(prisma: PrismaService, appConfig: AppConfigService);
    listUpcomingAndActive(): Promise<RoundDto[]>;
    createRound(actor: AuthUser): Promise<RoundDto>;
    getRoundDetail(roundId: string, viewer: AuthUser): Promise<{
        round: RoundDto;
        totalScore?: number;
        bestPlayer?: {
            username: string;
            score: number;
        } | null;
        currentUserScore?: number;
    }>;
    private computeRoundSummary;
    tap(roundId: string, user: AuthUser): Promise<{
        score: number;
    }>;
}
