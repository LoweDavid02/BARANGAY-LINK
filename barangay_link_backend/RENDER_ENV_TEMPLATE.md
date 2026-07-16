# Render Environment Variables Template

This file contains all environment variables that should be set in Render's Environment Variables section for deployment.

## Critical Database Configuration (MUST SET FIRST)

```
DB_CONNECTION=pgsql
DB_HOST=<YOUR_INTERNAL_DB_HOST>
DB_PORT=5432
DB_DATABASE=<YOUR_DB_NAME>
DB_USERNAME=<YOUR_DB_USERNAME>
DB_PASSWORD=<YOUR_DB_PASSWORD>
DB_SSLMODE=require
DB_CONNECT_TIMEOUT=10
```

**IMPORTANT**: 
- Use the **Internal Database URL** from Render Dashboard for `DB_HOST`
- `DB_SSLMODE=require` is MANDATORY for Render PostgreSQL
- `DB_CONNECT_TIMEOUT=10` prevents hanging connections

## Application Configuration

```
APP_NAME="Barangay Link"
APP_ENV=production
APP_KEY=<GENERATE_WITH_php_artisan_key:generate>
APP_DEBUG=false
APP_URL=<YOUR_RENDER_APP_URL>
```

## Logging

```
LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error
```

## Session & Cache

```
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
```

## Broadcasting

```
BROADCAST_CONNECTION=reverb
REVERB_APP_ID=152763
REVERB_APP_KEY=barangaylink_key
REVERB_APP_SECRET=barangaylink_secret
REVERB_HOST=<YOUR_RENDER_APP_URL_WITHOUT_HTTPS>
REVERB_PORT=8080
REVERB_SCHEME=https
```

## Mail Configuration

```
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=<YOUR_GMAIL_ADDRESS>
MAIL_PASSWORD=<YOUR_GMAIL_APP_PASSWORD>
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=<YOUR_GMAIL_ADDRESS>
MAIL_FROM_NAME="Barangay Link"
```

**Note**: For Gmail, you need to:
1. Enable 2-factor authentication
2. Generate an App Password (not your regular password)
3. Use the App Password in `MAIL_PASSWORD`

## Optional: Redis (if using)

```
REDIS_HOST=<YOUR_REDIS_HOST>
REDIS_PASSWORD=<YOUR_REDIS_PASSWORD>
REDIS_PORT=6379
```

## Deployment Steps

### 1. Set Up Database
- Create a PostgreSQL database on Render
- Copy the **Internal Database URL** components

### 2. Configure Environment Variables
- Go to your Render Web Service → Environment
- Add all variables from this template
- Replace all `<PLACEHOLDER>` values with actual values
- **CRITICAL**: Ensure `DB_SSLMODE=require` is set

### 3. Generate APP_KEY
- After first deployment (it will fail), run:
  ```bash
  php artisan key:generate --show
  ```
- Copy the generated key and set it as `APP_KEY` in Render

### 4. Run Migrations
- In Render Shell, run:
  ```bash
  php artisan migrate --force
  ```

### 5. Verify Connection
- Check logs: `php artisan migrate:status`
- Test API endpoints
- Monitor `storage/logs/laravel.log` for errors

## Troubleshooting

### 504 Gateway Timeout on Database Operations
1. Verify `DB_SSLMODE=require` is set
2. Confirm using **internal** database URL (not external)
3. Check `DB_CONNECT_TIMEOUT=10` is set
4. Ensure database instance is running (not sleeping)
5. Check Render logs for connection errors

### SSL/TLS Connection Errors
- Ensure `DB_SSLMODE=require`
- Verify PostgreSQL version compatibility
- Check database instance is accessible

### Mail Sending Failures
- Verify Gmail App Password is correct
- Check Gmail 2FA is enabled
- Ensure `MAIL_PORT=465` and `MAIL_ENCRYPTION=ssl`

### Real-time Broadcasting Issues
- Ensure `REVERB_HOST` uses your Render app URL
- Set `REVERB_SCHEME=https` for production
- Check WebSocket port accessibility

## Quick Copy Template for Render

Copy this to your Render Environment Variables (fill in the placeholders):

```
APP_NAME=Barangay Link
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=

DB_CONNECTION=pgsql
DB_HOST=
DB_PORT=5432
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
DB_SSLMODE=require
DB_CONNECT_TIMEOUT=10

LOG_CHANNEL=stack
LOG_STACK=single
LOG_LEVEL=error

SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database

BROADCAST_CONNECTION=reverb
REVERB_APP_ID=152763
REVERB_APP_KEY=barangaylink_key
REVERB_APP_SECRET=barangaylink_secret
REVERB_HOST=
REVERB_PORT=8080
REVERB_SCHEME=https

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=465
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=
MAIL_FROM_NAME=Barangay Link
```
