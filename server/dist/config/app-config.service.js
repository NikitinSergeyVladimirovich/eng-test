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
exports.AppConfigService = void 0;
const common_1 = require("@nestjs/common");
let AppConfigService = class AppConfigService {
    constructor() {
        this.databaseUrl = process.env.DATABASE_URL ?? '';
        this.jwtSecret = process.env.JWT_SECRET ?? 'change-me-in-production';
        this.jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '7d';
        this.roundDurationSeconds = Number(process.env.ROUND_DURATION ?? '60');
        this.cooldownDurationSeconds = Number(process.env.COOLDOWN_DURATION ?? '30');
        this.port = Number(process.env.PORT ?? '3000');
        this.cookieName = process.env.AUTH_COOKIE_NAME ?? 'access_token';
        this.nodeEnv = process.env.NODE_ENV ?? 'development';
    }
    get isProduction() {
        return this.nodeEnv === 'production';
    }
};
exports.AppConfigService = AppConfigService;
exports.AppConfigService = AppConfigService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], AppConfigService);
//# sourceMappingURL=app-config.service.js.map