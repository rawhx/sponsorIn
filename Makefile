.PHONY: setup up dev down logs shell test fresh build pint migrate seed db

setup:
	docker compose build
	docker compose up -d db
	docker compose run --rm app composer install
	docker compose run --rm vite npm install
	docker compose up -d
	docker compose exec app php artisan migrate --seed

up:
	docker compose up -d

dev:
	docker compose up

down:
	docker compose down

logs:
	docker compose logs -f app vite queue

shell:
	docker compose exec app bash

test:
	docker compose exec app php artisan test

fresh:
	docker compose exec app php artisan migrate:fresh --seed

build:
	docker compose run --rm vite npm run build

pint:
	docker compose exec app ./vendor/bin/pint

migrate:
	docker compose exec app php artisan migrate

seed:
	docker compose exec app php artisan db:seed

db:
	docker compose exec db psql -U sponsorin -d sponsorin
