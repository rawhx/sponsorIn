#!/usr/bin/env sh

set -e

if [ ! -d vendor ]; then
    composer install --no-interaction --prefer-dist
fi

if [ ! -f .env ]; then
    cp .env.example .env
fi

if ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --ansi --force
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

rm -f bootstrap/cache/config.php

php artisan config:clear --ansi >/dev/null

exec "$@"
