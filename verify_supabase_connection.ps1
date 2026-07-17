# Supabase Connection Verification Script
# Run this to check if your database is connected to Supabase

Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   SUPABASE CONNECTION VERIFICATION" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 1. Check Local .env Configuration
Write-Host "1. Checking Local Configuration..." -ForegroundColor Yellow
Write-Host ""

$envFile = "C:\BARANGAY_LINK\barangay_link_backend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile
    $dbHost = ($envContent | Select-String "^DB_HOST=").ToString().Replace("DB_HOST=", "")
    $dbPort = ($envContent | Select-String "^DB_PORT=").ToString().Replace("DB_PORT=", "")
    $dbUser = ($envContent | Select-String "^DB_USERNAME=").ToString().Replace("DB_USERNAME=", "")
    
    Write-Host "   DB_HOST: $dbHost"
    Write-Host "   DB_PORT: $dbPort"
    Write-Host "   DB_USER: $dbUser"
    Write-Host ""
    
    if ($dbHost -like "*supabase*") {
        Write-Host "   ✅ Local .env uses SUPABASE" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Local .env NOT using Supabase" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ .env file not found" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 2. Test Local Database Connection
Write-Host "2. Testing Local Database Connection..." -ForegroundColor Yellow
Write-Host ""

try {
    cd C:\BARANGAY_LINK\barangay_link_backend
    
    $result = php artisan tinker --execute="
        try {
            `$pdo = DB::connection()->getPdo();
            `$config = DB::connection()->getConfig();
            echo 'HOST:' . `$config['host'] . '|';
            echo 'PORT:' . `$config['port'] . '|';
            echo 'DATABASE:' . `$config['database'] . '|';
            echo 'USERS:' . DB::table('users')->count() . '|';
            echo 'TICKETS:' . DB::table('tickets')->count() . '|';
        } catch (Exception `$e) {
            echo 'ERROR:' . `$e->getMessage();
        }
    " 2>&1 | Select-String -Pattern "HOST:|ERROR:"
    
    if ($result -match "HOST:(.+?)\|PORT:(.+?)\|DATABASE:(.+?)\|USERS:(.+?)\|TICKETS:(.+?)\|") {
        Write-Host "   Host: $($matches[1])"
        Write-Host "   Port: $($matches[2])"
        Write-Host "   Database: $($matches[3])"
        Write-Host "   Users: $($matches[4])"
        Write-Host "   Tickets: $($matches[5])"
        Write-Host ""
        
        if ($matches[1] -like "*supabase*") {
            Write-Host "   ✅ LOCAL IS CONNECTED TO SUPABASE!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Local NOT connected to Supabase" -ForegroundColor Red
        }
    } elseif ($result -match "ERROR:(.+)") {
        Write-Host "   ❌ Connection Error: $($matches[1])" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Failed to test local connection" -ForegroundColor Red
    Write-Host "   Error: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 3. Test Production Backend
Write-Host "3. Testing Production Backend..." -ForegroundColor Yellow
Write-Host ""

Write-Host "   Pinging: https://barangay-link-backend.onrender.com/api/health"
Write-Host "   (This may take 30-60 seconds if backend is sleeping...)" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://barangay-link-backend.onrender.com/api/health" -UseBasicParsing -TimeoutSec 90
    $content = $response.Content | ConvertFrom-Json
    
    Write-Host "   Status Code: $($response.StatusCode)"
    Write-Host "   API Status: $($content.status)"
    Write-Host "   Database: $($content.database)"
    Write-Host "   Timestamp: $($content.timestamp)"
    Write-Host ""
    
    if ($content.database -eq "connected") {
        Write-Host "   ✅ PRODUCTION IS CONNECTED!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Production database disconnected" -ForegroundColor Red
    }
} catch {
    Write-Host "   ⚠️  Backend unavailable or starting..." -ForegroundColor Yellow
    Write-Host "   Error: $($_.Exception.Message)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   This is normal if:" -ForegroundColor Gray
    Write-Host "   - Backend is sleeping (Render free tier)" -ForegroundColor Gray
    Write-Host "   - Database is paused (Supabase free tier)" -ForegroundColor Gray
    Write-Host "   - Cold start in progress" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Try running this script again in 60 seconds" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# 4. Summary
Write-Host "SUMMARY:" -ForegroundColor Cyan
Write-Host ""
Write-Host "Local Configuration:" -ForegroundColor Yellow
Write-Host "  • .env file points to: $dbHost"
Write-Host ""

Write-Host "Expected Supabase Configuration:" -ForegroundColor Yellow
Write-Host "  • Host: aws-1-ap-northeast-2.pooler.supabase.com"
Write-Host "  • Port: 6543"
Write-Host "  • Username: postgres.kmrqovodmqvmifefgskw"
Write-Host ""

Write-Host "To check production Render environment:" -ForegroundColor Yellow
Write-Host "  1. Go to: https://dashboard.render.com"
Write-Host "  2. Click: barangay-link-backend"
Write-Host "  3. Click: Environment tab"
Write-Host "  4. Check: DB_HOST value"
Write-Host ""

Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Verification complete!" -ForegroundColor Green
Write-Host ""
