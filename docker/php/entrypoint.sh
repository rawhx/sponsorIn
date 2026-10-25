#!/usr/bin/env sh

set -e

export COMPOSER_ALLOW_SUPERUSER=1
export COMPOSER_HOME="${COMPOSER_HOME:-/tmp/composer}"

if [ ! -f vendor/autoload.php ]; then
    echo "vendor/autoload.php not found. Installing Composer dependencies..."
    composer install --no-interaction --prefer-dist --no-progress
fi

if [ ! -f .env ] && [ -f .env.example ]; then
    cp .env.example .env
fi

if [ -f .env ] && ! grep -q '^APP_KEY=base64:' .env; then
    php artisan key:generate --ansi --force || true
fi

mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache

rm -f bootstrap/cache/config.php bootstrap/cache/packages.php bootstrap/cache/services.php 2>/dev/null || true

php artisan config:clear --ansi >/dev/null 2>&1 || true

exec "$@"
