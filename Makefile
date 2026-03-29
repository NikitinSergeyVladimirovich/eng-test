# The Last of Guss — один командный запуск через Docker Compose
# Использование: make  (или явно: make up)

COMPOSE := docker compose

# На окружениях без Docker Buildx сборка падает; 0 = классический builder
export DOCKER_BUILDKIT ?= 0

.DEFAULT_GOAL := up

.PHONY: up down logs ps help

## Поднять postgres + api + web (сборка образов и логи в консоли)
up:
	$(COMPOSE) up --build

## То же в фоне
up-d:
	$(COMPOSE) up -d --build

## Остановить и убрать контейнеры (том БД сохраняется)
down:
	$(COMPOSE) down

## Логи фонового стека
logs:
	$(COMPOSE) logs -f

ps:
	$(COMPOSE) ps

help:
	@echo "make / make up   — собрать и запустить весь стек"
	@echo "make up-d        — то же в фоне"
	@echo "make down        — остановить"
	@echo "make logs        — логи (если запускали make up-d)"
	@echo "make help        — эта справка"
	@echo ""
	@echo "Порты хоста (занят 3000 и т.д.): скопируйте .env.example в .env"
	@echo "или передайте при запуске, например:"
	@echo "  API_HOST_PORT=3001 WEB_HOST_PORT=9080 make"
	@echo "Переменные: API_HOST_PORT WEB_HOST_PORT POSTGRES_HOST_PORT (см. .env.example)"
