"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const common_1 = require("@nestjs/common");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const app_module_1 = require("./app.module");
const app_config_service_1 = require("./config/app-config.service");
dotenv.config();
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = app.get(app_config_service_1.AppConfigService);
    app.use(cookieParser());
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));
    app.enableCors({
        origin: true,
        credentials: true,
    });
    await app.listen(config.port);
    console.log(`The Last of Guss API on http://localhost:${config.port}/api`);
}
bootstrap();
//# sourceMappingURL=main.js.map