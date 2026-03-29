import { RoundsService } from './rounds.service';
import { AuthUser } from '../../common/types/auth-user';
import { TapDto } from './dto/tap.dto';
export declare class RoundsController {
    private readonly roundsService;
    constructor(roundsService: RoundsService);
    listRounds(): Promise<import("./rounds.service").RoundDto[]>;
    getRound(uuid: string, user: AuthUser): Promise<{
        round: import("./rounds.service").RoundDto;
        totalScore?: number;
        bestPlayer?: {
            username: string;
            score: number;
        } | null;
        currentUserScore?: number;
    }>;
    createRound(user: AuthUser): Promise<import("./rounds.service").RoundDto>;
    tap(body: TapDto, user: AuthUser): Promise<{
        message: string;
        score: number;
    }>;
}
