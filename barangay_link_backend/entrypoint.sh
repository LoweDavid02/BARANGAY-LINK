#!/bin/sh

# Set application key if not set
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
    chown www-data:www-data /var/www/.env
fi

# Run migrations (gracefully handle failure if DB is not ready yet)
echo "Running database migrations..."
php artisan migrate --force || echo "Migration failed! Please check your DATABASE_URL environment variable."

# Ensure Admin & Personnel default accounts are seeded in production
php artisan db:seed --force || echo "Database seeding completed or skipped."

# Start Reverb server in the background
php artisan reverb:start --host=127.0.0.1 --port=8080 &

# Clear configuration, cache, route, and views to avoid stale configs
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Start php-fpm in background
php-fpm -D

# Start Nginx in foreground
nginx -g "daemon off;"
