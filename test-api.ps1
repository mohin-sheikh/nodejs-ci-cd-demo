Write-Host "===================================" -ForegroundColor Cyan
Write-Host "Testing Node.js TypeScript API" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check Endpoint..." -ForegroundColor Yellow
$response = curl -s http://localhost:3000/health
Write-Host $response
Write-Host ""

# Test 2: Welcome Endpoint
Write-Host "2. Testing Welcome Endpoint..." -ForegroundColor Yellow
$response = curl -s http://localhost:3000/
Write-Host $response
Write-Host ""

# Test 3: Get Users (should be empty)
Write-Host "3. Getting all users..." -ForegroundColor Yellow
$response = curl -s http://localhost:3000/api/users
Write-Host $response
Write-Host ""

# Test 4: Create a new user
Write-Host "4. Creating a new user..." -ForegroundColor Yellow
$user = @{
    name = "John Doe"
    email = "john@example.com"
    password = "secret123"
} | ConvertTo-Json

$response = curl -X POST http://localhost:3000/api/users `
    -H "Content-Type: application/json" `
    -d $user
Write-Host $response
Write-Host ""

# Test 5: Create another user
Write-Host "5. Creating another user..." -ForegroundColor Yellow
$user2 = @{
    name = "Jane Smith"
    email = "jane@example.com"
    password = "secret456"
} | ConvertTo-Json

$response = curl -X POST http://localhost:3000/api/users `
    -H "Content-Type: application/json" `
    -d $user2
Write-Host $response
Write-Host ""

# Test 6: Get all users (should have 2 users)
Write-Host "6. Getting all users after creation..." -ForegroundColor Yellow
$response = curl -s http://localhost:3000/api/users
Write-Host $response
Write-Host ""

# Test 7: Create a product
Write-Host "7. Creating a product..." -ForegroundColor Yellow
$product = @{
    name = "Laptop"
    description = "High-performance laptop with 16GB RAM"
    price = 999.99
    stock = 10
} | ConvertTo-Json

$response = curl -X POST http://localhost:3000/api/products `
    -H "Content-Type: application/json" `
    -d $product
Write-Host $response
Write-Host ""

# Test 8: Create another product
Write-Host "8. Creating another product..." -ForegroundColor Yellow
$product2 = @{
    name = "Mouse"
    description = "Wireless ergonomic mouse"
    price = 29.99
    stock = 50
} | ConvertTo-Json

$response = curl -X POST http://localhost:3000/api/products `
    -H "Content-Type: application/json" `
    -d $product2
Write-Host $response
Write-Host ""

# Test 9: Get all products
Write-Host "9. Getting all products..." -ForegroundColor Yellow
$response = curl -s http://localhost:3000/api/products
Write-Host $response
Write-Host ""

Write-Host "===================================" -ForegroundColor Green
Write-Host "API Testing Complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green