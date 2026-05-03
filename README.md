# Node.js TypeScript CI/CD Pipeline with PostgreSQL and JWT Authentication

## Project Overview

This is a production-ready Node.js TypeScript application featuring a complete CI/CD pipeline, PostgreSQL database integration, Redis caching, JWT-based authentication, and comprehensive testing. The project demonstrates modern backend development practices with a focus on security, maintainability, and automated deployments.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Runtime | Node.js | 18.x / 22.x |
| Language | TypeScript | 5.5.4 |
| Framework | Express | 4.21.2 |
| Database ORM | TypeORM | 0.3.28 |
| Database | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Authentication | JWT | 9.0.3 |
| Password Hashing | Argon2 | 0.44.0 |
| Validation | Joi | 18.1.1 |
| Testing | Jest | 29.7.0 |
| Linting | ESLint | 8.57.1 |
| Formatting | Prettier | 3.5.3 |
| Container | Docker | 28.0+ |
| CI/CD | GitHub Actions | - |
| Container Registry | Docker Hub | - |

## Project Structure

```
node-ts-cicd-demo/
│
├── .github/workflows/
│   ├── ci-cd.yml                     # CI/CD pipeline for main branch
│   └── ci-cd-dev.yml                 # CI/CD pipeline for dev branch
│
├── .husky/                           # Git pre-commit hooks
│   └── pre-commit                    # Runs lint-staged before commits
│
├── contrib/                          # Additional resources
│   └── Node.js TypeScript CI-CD Demo API.postman_collection.json
│
├── src/
│   ├── __tests__/                    # Test files
│   │   ├── setup.ts                  # Global test setup
│   │   ├── app.test.ts               # Application tests
│   │   ├── database.test.ts          # Database connection tests
│   │   └── unit/                     # Unit tests by module
│   │       ├── config/               # Configuration tests
│   │       ├── controllers/          # Controller tests
│   │       ├── entities/             # Entity tests
│   │       ├── middleware/           # Middleware tests
│   │       ├── repositories/         # Repository tests
│   │       ├── routes/               # Route tests
│   │       ├── services/             # Service tests
│   │       ├── utils/                # Utility tests
│   │       └── validators/           # Validator tests
│   │
│   ├── api/
│   │   ├── controllers/              # Request handlers
│   │   │   ├── auth.controller.ts    # Authentication endpoints
│   │   │   └── user.controller.ts    # User management endpoints
│   │   ├── middlewares/              # Express middleware
│   │   │   ├── auth.middleware.ts    # JWT authentication
│   │   │   ├── error.middleware.ts   # Global error handler
│   │   │   ├── logger.middleware.ts  # Request logging
│   │   │   ├── rateLimit.middleware.ts # Rate limiting
│   │   │   └── validation.middleware.ts # Request validation
│   │   └── routes/                   # API route definitions
│   │       ├── index.ts              # Route aggregation
│   │       ├── auth.routes.ts        # Auth endpoints
│   │       └── user.routes.ts        # User CRUD endpoints
│   │
│   ├── config/
│   │   ├── database.ts               # TypeORM data source configuration
│   │   ├── redis.ts                  # Redis connection configuration
│   │   └── validate.ts               # Environment variable validation
│   │
│   ├── entities/
│   │   └── user.entity.ts            # User database entity
│   │
│   ├── migrations/
│   │   └── 1774442502487-CreateUserTable.ts # Database migration
│   │
│   ├── repositories/
│   │   └── user.repository.ts        # Database operations
│   │
│   ├── services/
│   │   ├── auth.service.ts           # Authentication logic
│   │   ├── jwt.service.ts            # JWT token operations
│   │   ├── password.service.ts       # Password hashing and validation
│   │   ├── redis.service.ts          # Redis cache operations
│   │   └── user.service.ts           # User business logic
│   │
│   ├── utils/
│   │   ├── response.ts               # Standardized API responses
│   │   ├── responseMessages.ts       # Response message constants
│   │   └── statusCodes.ts            # HTTP status code constants
│   │
│   ├── validators/
│   │   ├── auth.validator.ts         # Auth request validation schemas
│   │   └── user.validator.ts         # User request validation schemas
│   │
│   ├── app.ts                        # Express application configuration
│   └── server.ts                     # Application entry point
│
├── .dockerignore                     # Docker build ignore rules
├── .env                              # Environment variables (gitignored)
├── .env.example                      # Example environment variables
├── .env.test                         # Test environment variables
├── .eslintrc.json                    # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── docker-compose.yml                # Docker services (PostgreSQL + Redis + pgAdmin)
├── Dockerfile                        # Multi-stage Docker build
├── jest.config.js                    # Jest testing configuration
├── package.json                      # Project dependencies and scripts
├── tsconfig.json                     # TypeScript compiler configuration
├── tsconfig.test.json                # TypeScript test configuration
└── README.md                         # Project documentation
```

## Features

Database Integration
- PostgreSQL database with TypeORM for type-safe database operations
- Database migrations for schema version control
- Connection pooling and automatic reconnection
- Health check endpoint monitors database connectivity

Redis Caching
- Redis integration for session management and rate limiting
- Token blacklisting for secure logout
- Active session tracking across multiple devices
- User profile caching for improved performance

Authentication and Security
- JWT-based authentication with access and refresh tokens
- Argon2 password hashing (industry standard for password security)
- Password strength validation with configurable requirements
- Protected routes with authentication middleware
- Automatic password rehashing when security parameters change
- Refresh token rotation and blacklisting

Rate Limiting
- Login rate limiting (5 attempts per 15 minutes)
- API rate limiting (100 requests per minute)
- Strict rate limiting (10 requests per hour for sensitive operations)
- Redis-based rate limit counters
- Rate limit headers for client-side awareness

API Design
- RESTful API architecture following best practices
- Standardized response format across all endpoints
- Comprehensive request validation using Joi schemas
- Centralized error handling with appropriate HTTP status codes
- Request logging with sensitive data masking

Code Quality
- TypeScript for type safety and better developer experience
- ESLint for code quality and consistency
- Prettier for automatic code formatting
- Husky pre-commit hooks run linting and formatting
- Comprehensive test coverage with Jest

DevOps and Deployment
- Multi-stage Docker builds for optimized production images
- GitHub Actions CI/CD pipeline with multiple stages
- Automated testing on pull requests and pushes
- Security scanning with npm audit
- Automatic Docker image building and pushing
- Docker Compose for local development with PostgreSQL, Redis, and pgAdmin

## Prerequisites

- Node.js 18.x or 22.x
- npm 9 or higher
- PostgreSQL 15 (or Docker for containerized database)
- Redis 7 (or Docker for containerized Redis)
- Git
- Docker (optional, for containerization)
- Postman (for API testing, collection included in contrib folder)

## Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/mohin-sheikh/nodejs-ci-cd-demo.git
cd nodejs-ci-cd-demo
npm install
```

## Environment Configuration

Create a `.env` file in the root directory based on `.env.example`:

```env
# Application
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5433
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=node_ts_demo

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=redis123
REDIS_DB=0

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d
```

### Environment Variables Reference

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Application port | No | 3000 |
| NODE_ENV | Environment (development/production/test) | No | development |
| DB_HOST | PostgreSQL host | Yes | - |
| DB_PORT | PostgreSQL port | Yes | - |
| DB_USERNAME | PostgreSQL username | Yes | - |
| DB_PASSWORD | PostgreSQL password | Yes | - |
| DB_DATABASE | PostgreSQL database name | Yes | - |
| REDIS_HOST | Redis host | No | localhost |
| REDIS_PORT | Redis port | No | 6379 |
| REDIS_PASSWORD | Redis password | No | - |
| REDIS_DB | Redis database number | No | 0 |
| ALLOWED_ORIGINS | CORS allowed origins (comma-separated) | No | * |
| JWT_SECRET | JWT access token secret | No | default-secret-key |
| JWT_EXPIRES_IN | JWT access token expiration | No | 7d |
| JWT_REFRESH_SECRET | JWT refresh token secret | No | default-refresh-key |
| JWT_REFRESH_EXPIRES_IN | JWT refresh token expiration | No | 30d |

## Database and Redis Setup

### Using Docker Compose (Recommended for Development)

```bash
# Start PostgreSQL, Redis, and pgAdmin containers
npm run docker:up

# Stop containers
npm run docker:down

# View container logs
npm run docker:logs
```

The Docker Compose setup includes:
- PostgreSQL 15 on port 5433 (to avoid conflict with local PostgreSQL)
- Redis 7 on port 6379 with password authentication
- pgAdmin 4 on port 5050 (login: admin@admin.com / admin)

### Using Local PostgreSQL and Redis

If you have PostgreSQL and Redis installed locally, update the `.env` file with your local configuration:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=node_ts_demo

REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
REDIS_DB=0
```

### Run Database Migrations

```bash
# Run all pending migrations
npm run migration:run

# Generate a new migration after entity changes
npm run migration:generate -- src/migrations/MigrationName

# Create an empty migration file
npm run migration:create -- src/migrations/MigrationName

# Revert the last migration
npm run migration:revert

# Show migration status
npm run migration:show

# Reset database (revert all and re-run migrations)
npm run db:reset
```

## Running the Application

### Development Mode

```bash
# Start with hot reload using nodemon
npm run dev

# Or build and run
npm run build
npm start
```

### Production Mode

```bash
# Build TypeScript to JavaScript
npm run build

# Start production server
NODE_ENV=production npm start
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Compile TypeScript to JavaScript |
| `npm test` | Run all tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:integration` | Run integration tests only |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint issues |
| `npm run format` | Format code with Prettier |
| `npm run format:check` | Check code formatting |
| `npm run typeorm` | Run TypeORM CLI commands |
| `npm run migration:run` | Run database migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:generate` | Generate migration from entity changes |
| `npm run db:reset` | Reset and re-run all migrations |
| `npm run db:seed` | Run database seeders |
| `npm run docker:up` | Start Docker containers |
| `npm run docker:down` | Stop Docker containers |
| `npm run docker:logs` | View Docker container logs |

## API Documentation

### Base URL

```
http://localhost:3000
```

### Postman Collection

A complete Postman collection for testing all API endpoints is available in the `contrib` folder:

```
contrib/Node.js TypeScript CI-CD Demo API.postman_collection.json
```

To use the collection:
1. Open Postman
2. Click Import
3. Select the collection file from the contrib folder
4. Set the environment variable `baseUrl` to `http://localhost:3000`
5. Run the requests in the recommended order

The collection includes:
- Public endpoints (health check, welcome, user registration)
- Authentication endpoints (login, refresh token, logout)
- Protected user management endpoints (CRUD operations)
- Rate limiting test scenarios
- Error case testing
- Complete authentication workflow

### Response Format

All API responses follow a standardized format:

Success Response:
```json
{
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

Error Response:
```json
{
  "statusCode": 400,
  "message": "Error message",
  "data": {}
}
```

### Health Check

```
GET /health
```

Response:
```json
{
  "statusCode": 200,
  "message": "Health check passed",
  "data": {
    "status": "OK",
    "environment": "development",
    "database": "connected",
    "redis": "connected"
  }
}
```

### Welcome Endpoint

```
GET /
```

Response:
```json
{
  "statusCode": 200,
  "message": "API is running",
  "data": {
    "message": "Welcome to Node.js TypeScript CI/CD Demo API"
  }
}
```

### Authentication Endpoints

#### Register User

```
POST /api/users
```

Request Body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "Test@123456"
}
```

Response (201 Created):
```json
{
  "statusCode": 201,
  "message": "User created successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Login

```
POST /api/auth/login
```

Request Body:
```json
{
  "email": "john@example.com",
  "password": "Test@123456"
}
```

Response:
```json
{
  "statusCode": 200,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "7d"
    }
  }
}
```

#### Refresh Token

```
POST /api/auth/refresh
```

Request Body:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response:
```json
{
  "statusCode": 200,
  "message": "Token refreshed successfully",
  "data": {
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "expiresIn": "7d"
    }
  }
}
```

#### Logout

```
POST /api/auth/logout
```

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "statusCode": 200,
  "message": "Logged out successfully",
  "data": {}
}
```

#### Logout All Devices

```
POST /api/auth/logout-all
```

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "statusCode": 200,
  "message": "Logged out from all devices successfully",
  "data": {}
}
```

#### Get Active Sessions

```
GET /api/auth/sessions
```

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "statusCode": 200,
  "message": "Active sessions retrieved",
  "data": {
    "sessions": [
      {
        "tokenId": "abc123...",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### Get Current User

```
GET /api/auth/me
```

Headers:
```
Authorization: Bearer <access_token>
```

Response:
```json
{
  "statusCode": 200,
  "message": "Current user retrieved",
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john@example.com",
      "name": "John Doe"
    }
  }
}
```

### User Management Endpoints

All user endpoints require authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

#### Get All Users

```
GET /api/users
```

Response:
```json
{
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "John Doe",
      "email": "john@example.com",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

#### Get User by ID

```
GET /api/users/:id
```

Response:
```json
{
  "statusCode": 200,
  "message": "User retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "John Doe",
    "email": "john@example.com",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### Update User

```
PUT /api/users/:id
```

Request Body:
```json
{
  "name": "Jane Doe",
  "isActive": false
}
```

Response:
```json
{
  "statusCode": 200,
  "message": "User updated successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Jane Doe",
    "email": "john@example.com",
    "isActive": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.001Z"
  }
}
```

#### Delete User

```
DELETE /api/users/:id
```

Response (204 No Content):
```json
{
  "statusCode": 204,
  "message": "User deleted successfully",
  "data": {}
}
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- Maximum 128 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

## Rate Limiting

The application implements three levels of rate limiting:

| Limiter | Window | Max Requests | Endpoints Protected |
|---------|--------|--------------|---------------------|
| Login Rate Limit | 15 minutes | 5 | POST /api/auth/login |
| API Rate Limit | 1 minute | 100 | GET /api/users, GET /api/users/:id, PUT /api/users/:id |
| Strict Rate Limit | 1 hour | 10 | POST /api/users, DELETE /api/users/:id |

Rate limit headers are included in all responses:
- `X-RateLimit-Limit`: Maximum requests allowed in the window
- `X-RateLimit-Remaining`: Remaining requests in the current window
- `X-RateLimit-Reset`: Timestamp when the limit resets

## Testing

### Test Structure

The project uses Jest for testing with the following structure:
- Unit tests for individual components
- Integration tests for API endpoints
- Test coverage reporting with thresholds

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Run integration tests only
npm run test:integration

# Run tests with coverage in watch mode
npm run test:watch:coverage
```

### Test Coverage Thresholds

| Metric | Threshold |
|--------|-----------|
| Functions | 0% (configurable) |
| Lines | 80% |
| Statements | 0% (configurable) |

### Test Files Location

Tests are organized in the `src/__tests__/` directory mirroring the source structure:
- `unit/config/` - Configuration validation tests
- `unit/controllers/` - Controller tests
- `unit/entities/` - Entity tests
- `unit/middleware/` - Middleware tests
- `unit/repositories/` - Repository tests
- `unit/routes/` - Route tests
- `unit/services/` - Service tests
- `unit/utils/` - Utility tests
- `unit/validators/` - Validator tests

## Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript rules:
- TypeScript-specific linting with @typescript-eslint
- Unused variable detection (variables prefixed with _ are ignored)
- No explicit any warnings
- Consistent error handling patterns

### Prettier Configuration

Code formatting is enforced with Prettier:
- 2 spaces indentation
- Single quotes
- Semicolons
- 100 character line width
- Trailing commas in ES5

### Git Hooks

Husky manages pre-commit hooks that run lint-staged:
- Automatically fixes ESLint issues
- Formats code with Prettier
- Runs on all TypeScript files in the src directory

## Docker

### Docker Configuration

The Dockerfile uses a multi-stage build strategy for optimized production images:

Stage 1 - Builder:
- Installs all dependencies including devDependencies
- Compiles TypeScript to JavaScript
- Prepares build artifacts

Stage 2 - Production:
- Copies only production dependencies
- Copies compiled code from builder stage
- Creates a non-root user for security
- Configures health check endpoint

### Docker Commands

```bash
# Build the Docker image
docker build -t node-ts-cicd-demo .

# Run the container
docker run -p 3000:3000 node-ts-cicd-demo

# Run with environment variables
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=postgres \
  -e DB_PORT=5432 \
  -e DB_USERNAME=postgres \
  -e DB_PASSWORD=postgres \
  -e DB_DATABASE=node_ts_demo \
  -e REDIS_HOST=redis \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=redis123 \
  --name node-app \
  node-ts-cicd-demo

# View logs
docker logs node-app

# Stop container
docker stop node-app

# Remove container
docker rm node-app

# Pull from Docker Hub (when published)
docker pull mohinsheikh/node-ts-cicd-demo:latest
```

### Docker Compose

The docker-compose.yml file provides a complete development environment:
- PostgreSQL 15 database on port 5433
- Redis 7 on port 6379 with password authentication
- pgAdmin 4 on port 5050 for database management
- Persistent volumes for data storage
- Health checks for database and Redis readiness

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration and deployment with two separate workflow files.

### Main Branch Pipeline (ci-cd.yml)

Triggers on pushes to `main` and `develop` branches, and pull requests to `main`.

Pipeline Stages:

1. Build and Test
   - Checks out code
   - Sets up Node.js 22
   - Installs dependencies with npm ci
   - Checks code formatting with Prettier
   - Runs ESLint
   - Builds TypeScript project
   - Runs tests with coverage
   - Uploads coverage reports to Codecov

2. Security Scan
   - Runs npm audit for vulnerability detection
   - Continues on error (non-blocking)

3. Docker Build and Push (main branch only)
   - Sets up Docker Buildx for multi-platform builds
   - Logs into Docker Hub
   - Builds Docker image
   - Pushes with tags: `latest` and commit SHA

4. Deploy (main branch only)
   - Placeholder for deployment configuration

### Development Branch Pipeline (ci-cd-dev.yml)

Triggers on pushes and pull requests to `dev` branch with PostgreSQL and Redis integration testing.

Pipeline Stages:

1. Build and Test with PostgreSQL and Redis
   - Spins up PostgreSQL 15 container as a service
   - Creates .env file with database and Redis configuration
   - Runs database migrations
   - Executes tests with database and Redis integration

2. Security Scan
   - Runs npm audit for vulnerability detection

3. Docker Build and Push (dev branch only)
   - Builds and pushes Docker image with tags: `dev` and `dev-{commit-sha}`

### Branch Strategy

| Branch | Trigger | Pipeline Actions |
|--------|---------|------------------|
| main | Push | Build, Test, Security Scan, Docker Build, Deploy |
| main | Pull Request | Build, Test, Security Scan |
| develop | Push | Build, Test |
| dev | Push | Build, Test with PostgreSQL and Redis, Security Scan, Docker Build |
| dev | Pull Request | Build, Test with PostgreSQL and Redis |

### Required GitHub Secrets

| Secret Name | Description |
|-------------|-------------|
| `CODECOV_TOKEN` | Token for uploading coverage reports |
| `DOCKER_USERNAME` | Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub access token (not password) |

## Error Handling

The application implements centralized error handling with appropriate HTTP status codes:

| Status Code | Description | When Used |
|-------------|-------------|-----------|
| 200 | OK | Successful GET, PUT operations |
| 201 | Created | Successful POST operations |
| 204 | No Content | Successful DELETE operations |
| 400 | Bad Request | Validation errors, malformed requests |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Authenticated but not authorized |
| 404 | Not Found | Resource does not exist |
| 409 | Conflict | Duplicate email or constraint violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server errors |

## Security Features

Password Security
- Argon2id hashing with configurable memory cost, time cost, and parallelism
- Automatic password rehashing when algorithm parameters change
- Password validation before hashing
- Passwords never returned in API responses

JWT Security
- Separate secrets for access and refresh tokens
- Configurable expiration times
- Token validation with proper error handling
- Refresh token rotation support
- Token blacklisting on logout

Input Validation
- Joi validation for all request bodies, parameters, and query strings
- Automatic stripping of unknown fields
- Detailed validation error messages

Rate Limiting
- Redis-based rate limit counters
- Protection against brute force attacks
- Different limits for different endpoint types

Database Security
- Parameterized queries prevent SQL injection
- Sensitive fields (password) excluded from default queries
- Database credentials from environment variables only

## Docker Image Tags

| Tag | Description |
|-----|-------------|
| `latest` | Most recent production build from main branch |
| `{commit-sha}` | Versioned build from main branch |
| `dev` | Most recent development build from dev branch |
| `dev-{commit-sha}` | Versioned development build from dev branch |

## Deployment

### Deploy with Docker

```bash
# Pull the latest production image
docker pull mohinsheikh/node-ts-cicd-demo:latest

# Run the container with environment variables
docker run -d -p 3000:3000 \
  -e NODE_ENV=production \
  -e DB_HOST=your-db-host \
  -e DB_PORT=5432 \
  -e DB_USERNAME=your-db-user \
  -e DB_PASSWORD=your-db-password \
  -e DB_DATABASE=your-db-name \
  -e REDIS_HOST=your-redis-host \
  -e REDIS_PORT=6379 \
  -e REDIS_PASSWORD=your-redis-password \
  -e JWT_SECRET=your-jwt-secret \
  -e JWT_REFRESH_SECRET=your-refresh-secret \
  --name node-api \
  mohinsheikh/node-ts-cicd-demo:latest
```

### Deployment Platforms

The Docker image can be deployed to:
- AWS ECS (Elastic Container Service)
- AWS EKS (Elastic Kubernetes Service)
- Google Cloud Run
- Azure Container Instances
- Azure Kubernetes Service (AKS)
- DigitalOcean App Platform
- Heroku Container Registry
- Any platform supporting Docker containers

## Troubleshooting

### Database Connection Issues

Problem: Cannot connect to PostgreSQL
Solution:
- Verify database container is running: `docker ps`
- Check database credentials in .env file
- Ensure database port is not blocked
- Run `npm run docker:up` to start containers

### Redis Connection Issues

Problem: Cannot connect to Redis
Solution:
- Verify Redis container is running: `docker ps`
- Check Redis credentials in .env file
- Ensure Redis port is not blocked
- Run `npm run docker:up` to start containers

### Migration Errors

Problem: Migration fails with duplicate key error
Solution:
- Reset database: `npm run db:reset`
- Or revert migration: `npm run migration:revert` followed by `npm run migration:run`

### TypeScript Compilation Errors

Problem: TypeScript version mismatch
Solution:
- Ensure TypeScript version 5.5.4: `npm install --save-dev typescript@5.5.4`

### Jest Test Failures

Problem: Tests fail with database connection issues
Solution:
- Ensure test environment is configured in .env.test
- Run tests with `NODE_ENV=test npm test`

### Docker Build Fails

Problem: Husky not found during Docker build
Solution:
- The Dockerfile uses `--ignore-scripts` to skip husky installation

### JWT Authentication Issues

Problem: Token validation fails
Solution:
- Verify JWT_SECRET and JWT_REFRESH_SECRET are set
- Ensure tokens are passed with Bearer prefix
- Check token expiration time

### CORS Errors

Problem: API requests blocked by CORS
Solution:
- Configure ALLOWED_ORIGINS with your frontend URL
- For development, CORS is configured to accept all origins

## License

This project is licensed under the MIT License.

## Author

Mohin Sheikh
- GitHub: [@mohin-sheikh](https://github.com/mohin-sheikh)
- Project Repository: [nodejs-ci-cd-demo](https://github.com/mohin-sheikh/nodejs-ci-cd-demo)
- Docker Hub: [mohinsheikh](https://hub.docker.com/u/mohinsheikh)
