#!/bin/sh

# Set application key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

# Run migrations
php artisan migrate --force

# Start Reverb server in the background
php artisan reverb:start --host=127.0.0.1 --port=8080 &

# Start php-fpm in background
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"
