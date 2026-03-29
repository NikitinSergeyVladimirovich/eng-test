"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoundsService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma/prisma.service");
const app_config_service_1 = require("../../config/app-config.service");
const scoring_1 = require("../../common/utils/scoring");
function roundStatus(now, startsAt, endsAt) {
    if (now < startsAt) {
        return 'cooldown';
    }
    if (now >= endsAt) {
        return 'finished';
    }
    return 'active';
}
function toRoundDto(round) {
    const now = new Date();
    return {
        uuid: round.id,
        start_datetime: round.startsAt.toISOString(),
        end_datetime: round.endsAt.toISOString(),
        status: roundStatus(now, round.startsAt, round.endsAt),
    };
}
let RoundsService = class RoundsService {
    constructor(prisma, appConfig) {
        this.prisma = prisma;
        this.appConfig = appConfig;
    }
    async listUpcomingAndActive() {
        const now = new Date();
        const rows = await this.prisma.round.findMany({
            where: { endsAt: { gt: now } },
            orderBy: { startsAt: 'asc' },
        });
        return rows.map(toRoundDto);
    }
    async createRound(actor) {
        if (actor.role !== client_1.UserRole.admin) {
            throw new common_1.ForbiddenException('Only admin can create rounds');
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
    async getRoundDetail(roundId, viewer) {
        const round = await this.prisma.round.findUnique({ where: { id: roundId } });
        if (!round) {
            throw new common_1.NotFoundException('Round not found');
        }
        const dto = toRoundDto(round);
        const now = new Date();
        const participation = await this.prisma.roundParticipation.findUnique({
            where: {
                userId_roundId: { userId: viewer.userId, roundId },
            },
        });
        const taps = participation?.taps ?? 0;
        const currentUserScore = viewer.role === client_1.UserRole.nikita ? 0 : (0, scoring_1.pointsFromTaps)(taps);
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
    async computeRoundSummary(roundId) {
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
        let best = null;
        for (const p of participations) {
            if (p.user.role === client_1.UserRole.nikita) {
                continue;
            }
            const score = (0, scoring_1.pointsFromTaps)(p.taps);
            if (!best || score > best.score) {
                best = { username: p.user.login, score };
            }
        }
        return {
            totalScore: round.totalPoints,
            bestPlayer: best,
        };
    }
    async tap(roundId, user) {
        if (user.role === client_1.UserRole.nikita) {
            return { score: 0 };
        }
        return this.prisma.$transaction(async (tx) => {
            const round = await tx.round.findUnique({ where: { id: roundId } });
            if (!round) {
                throw new common_1.NotFoundException('Round not found');
            }
            const now = new Date();
            if (now < round.startsAt || now >= round.endsAt) {
                throw new common_1.BadRequestException('Round is not active');
            }
            const existing = await tx.roundParticipation.findUnique({
                where: {
                    userId_roundId: { userId: user.userId, roundId },
                },
            });
            const prevTaps = existing?.taps ?? 0;
            const delta = (0, scoring_1.pointsDeltaForNextTap)(prevTaps);
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
            const newScore = (0, scoring_1.pointsFromTaps)(prevTaps + 1);
            return { score: newScore };
        }, {
            isolationLevel: client_1.Prisma.TransactionIsolationLevel.Serializable,
        });
    }
};
exports.RoundsService = RoundsService;
exports.RoundsService = RoundsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        app_config_service_1.AppConfigService])
], RoundsService);
//# sourceMappingURL=rounds.service.js.map