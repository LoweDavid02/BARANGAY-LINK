FROM php:8.2-fpm

# Install system dependencies
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    nginx \
    libpq-dev

# Clear cache
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Install PHP extensions
RUN docker-php-ext-install pdo_pgsql pgsql mbstring xml exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy existing application directory contents
COPY . /var/www

# Copy existing application directory permissions
COPY --chown=www-data:www-data . /var/www

# Install Composer dependencies
RUN composer install --no-interaction --optimize-autoloader --no-dev

# Copy Nginx Configuration
COPY nginx.conf /etc/nginx/sites-available/default

# Expose port 80
EXPOSE 80

# Make entrypoint script executable
RUN chmod +x /var/www/entrypoint.sh

ENTRYPOINT ["/var/www/entrypoint.sh"]
