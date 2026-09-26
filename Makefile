# Useful project commands

.PHONY: install dev build start lint prisma-generate prisma-studio db-seed profile-check profile dev-setup help reset-db migrate generate test clean up down

DB_URL='postgresql://user:password@localhost:5432/ai_job_application'

help:
	@echo "Available commands:"
	@echo "  make install        - install dependencies"
	@echo "  make dev            - run the Next.js dev server"
	@echo "  make build          - create a production build"
	@echo "  make start          - run the production app"
	@echo "  make lint           - run ESLint"
	@echo "  make test           - run the test suite"
	@echo "  make profile        - open the profile page in the browser"
	@echo "  make migrate        - run Prisma migrations"
	@echo "  make generate       - generate Prisma client"
	@echo "  make prisma-studio  - open Prisma Studio"
	@echo "  make db-seed        - seed the profile data"
	@echo "  make reset-db       - reset the local Prisma database"
	@echo "  make dev-setup      - install deps + generate Prisma client"
	@echo "  make profile-check  - run a production build check"
	@echo "  make up             - start Docker services (future setup)"
	@echo "  make down           - stop Docker services (future setup)"
	@echo "  make clean          - remove build artifacts and caches"

install:
	npm install

dev:
	npm run dev

build:
	DATABASE_URL='$(DB_URL)' npm run build

start:
	npm run start

lint:
	npm run lint

test:
	npm test -- --runInBand

profile:
	npm run dev

migrate:
	DATABASE_URL='$(DB_URL)' npx prisma migrate dev

generate:
	DATABASE_URL='$(DB_URL)' npx prisma generate

prisma-generate: generate

prisma-studio:
	DATABASE_URL='$(DB_URL)' npx prisma studio

db-seed:
	curl -X POST http://localhost:3000/api/profile/seed

reset-db:
	DATABASE_URL='$(DB_URL)' npx prisma migrate reset --force

profile-check:
	DATABASE_URL='$(DB_URL)' npx prisma generate && DATABASE_URL='$(DB_URL)' npm run build

dev-setup: install generate

up:
	docker compose up -d

down:
	docker compose down

clean:
	rm -rf .next node_modules/.cache
	@echo "Cleaned build artifacts and caches."
