# The Last of Guss

Браузерный кликер: NestJS + Prisma + PostgreSQL, JWT (httpOnly cookie + опционально `Authorization: Bearer`), React + Vite.

## Локальная разработка

1. Поднять PostgreSQL и задать `DATABASE_URL` (см. `server/env.example`).
2. Бэкенд:

```bash
cd server
cp env.example .env
# отредактировать DATABASE_URL
npx prisma migrate dev
npm run start:dev
```

API: `http://localhost:3000/api` (префикс `api`).

3. Фронтенд:

```bash
cd client
npm install
npm run dev
```

Vite проксирует `/api` → `http://localhost:3000`. Запросы идут с `credentials: 'include'`, JWT в cookie.

Переменные раунда: `ROUND_DURATION` и `COOLDOWN_DURATION` (секунды) в `.env` сервера.

## Docker (одна команда)

Из каталога `eng-test`:

```bash
make
```

Эквивалентно `DOCKER_BUILDKIT=0 docker compose up --build` (см. `Makefile`). Фон: `make up-d`, остановка: `make down`.

**Порты на машине** (если `3000`, `8080` или `5432` заняты): скопируйте `cp .env.example .env` и выставьте `API_HOST_PORT`, `WEB_HOST_PORT`, `POSTGRES_HOST_PORT`, либо одной строкой:

```bash
API_HOST_PORT=3001 WEB_HOST_PORT=9080 POSTGRES_HOST_PORT=5433 make
```

Docker Compose подхватывает `.env` в том же каталоге, что и `docker-compose.yml`.

Вручную без Make:

```bash
DOCKER_BUILDKIT=0 docker compose up --build
```

- UI: `http://localhost:<WEB_HOST_PORT>` (по умолчанию 8080)  
- Прямой API: `http://localhost:<API_HOST_PORT>/api` (по умолчанию 3000); в браузере удобнее заходить через UI — nginx проксирует `/api` на контейнер `api`.

Секрет JWT: задайте `JWT_SECRET` в окружении хоста или в `docker-compose.yml`.

## Запуск продакшен-сборки без Docker

```bash
cd server && npm run build && node dist/main.js
cd client && npm run build && npx vite preview
```

## Роли

- `admin` — логин `admin` при первой регистрации.
- `nikita` — логин `Никита`; тапы не влияют на очки и сумму раунда.
- остальные — `survivor`.

## Масштабирование

Состояние только в PostgreSQL; тапы обрабатываются в транзакции с уровнем изоляции `Serializable`, без привязки сессии к инстансу.
