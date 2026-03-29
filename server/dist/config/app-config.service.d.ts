export declare class AppConfigService {
    readonly databaseUrl: string;
    readonly jwtSecret: string;
    readonly jwtExpiresIn: string;
    readonly roundDurationSeconds: number;
    readonly cooldownDurationSeconds: number;
    readonly port: number;
    readonly cookieName: string;
    readonly nodeEnv: string;
    constructor();
    get isProduction(): boolean;
}
