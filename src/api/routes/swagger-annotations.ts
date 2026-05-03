/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Node.js TypeScript CI/CD Demo API
 *   version: 1.0.0
 *   description: |
 *     ## API Versioning
 *
 *     This API uses versioning with the prefix `/v1`. All endpoints are accessible under:
 *     - `http://localhost:3000/api/v1/`
 *     - Legacy support: `http://localhost:3000/api/` (redirects to v1)
 *
 *     ## Rate Limiting
 *
 *     This API implements three levels of rate limiting:
 *
 *     | Limiter | Window | Max Requests | Endpoints |
 *     |---------|--------|--------------|-----------|
 *     | Login | 15 minutes | 5 | POST /api/v1/auth/login |
 *     | API | 1 minute | 100 | GET /api/v1/users, GET /api/v1/users/:id, PUT /api/v1/users/:id |
 *     | Strict | 1 hour | 10 | POST /api/v1/users, DELETE /api/v1/users/:id |
 *
 *     Rate limit information is returned in response headers:
 *     - `X-RateLimit-Limit`: Maximum requests allowed
 *     - `X-RateLimit-Remaining`: Remaining requests
 *     - `X-RateLimit-Reset`: Reset timestamp
 *
 *     ## Authentication
 *
 *     Most endpoints require JWT authentication. To authenticate:
 *     1. Call `POST /api/v1/auth/login` to obtain access and refresh tokens
 *     2. Include the access token in the `Authorization` header: `Bearer <access_token>`
 *     3. When the access token expires, use `POST /api/v1/auth/refresh` with the refresh token
 *
 *     ## Password Requirements
 *
 *     - Minimum 8 characters
 *     - Maximum 128 characters
 *     - At least one uppercase letter
 *     - At least one lowercase letter
 *     - At least one number
 *     - At least one special character (@$!%*?&)
 *
 *   license:
 *     name: MIT
 *     url: https://opensource.org/licenses/MIT
 *   contact:
 *     name: Mohin Sheikh (Github)
 *     url: https://github.com/mohin-sheikh
 *
 * servers:
 *   - url: http://localhost:3000/api/v1
 *     description: Development Server (Version 1)
 *   - url: http://localhost:3000/api
 *     description: Development Server (Legacy - redirects to v1)
 *
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: Enter your JWT access token
 *
 *   schemas:
 *     RateLimitHeaders:
 *       type: object
 *       properties:
 *         X-RateLimit-Limit:
 *           type: integer
 *           description: Maximum requests allowed in the window
 *         X-RateLimit-Remaining:
 *           type: integer
 *           description: Remaining requests in the current window
 *         X-RateLimit-Reset:
 *           type: integer
 *           description: Timestamp when the limit resets
 *
 *   responses:
 *     TooManyRequests:
 *       description: Rate limit exceeded
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 429
 *             message: Too many requests. Please try again in 45 seconds.
 *             data: {}
 *
 *     Unauthorized:
 *       description: Missing or invalid authentication token
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 401
 *             message: No token provided. Please login first.
 *             data: {}
 *
 *     Conflict:
 *       description: Resource conflict (e.g., duplicate email)
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 409
 *             message: User with this email already exists
 *             data: {}
 *
 *     ValidationError:
 *       description: Request validation failed
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 400
 *             message: Validation failed
 *             data:
 *               details:
 *                 - field: email
 *                   message: "Email is required"
 *                 - field: password
 *                   message: "Password must be at least 8 characters"
 */

// Health Check Routes
/**
 * @swagger
 * /health:
 *   get:
 *     summary: Check API health status
 *     description: Returns the health status of the API, database, and Redis connections
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: All services are healthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Health check passed
 *               data:
 *                 status: OK
 *                 environment: development
 *                 database: connected
 *                 redis: connected
 *       503:
 *         description: Some services are unhealthy
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 503
 *               message: Health check passed
 *               data:
 *                 status: DEGRADED
 *                 environment: development
 *                 database: connected
 *                 redis: disconnected
 */

/**
 * @swagger
 * /:
 *   get:
 *     summary: API welcome message
 *     description: Returns a welcome message for the API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Welcome message
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: API is running
 *               data:
 *                 message: Welcome to Node.js TypeScript CI/CD Demo API
 */

// Authentication Routes (Version 1)
/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     description: Authenticates a user and returns access and refresh tokens
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginInput'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Login successful
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   isActive: true
 *                   createdAt: "2024-01-01T00:00:00.000Z"
 *                   updatedAt: "2024-01-01T00:00:00.000Z"
 *                 tokens:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIs..."
 *                   refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 *                   expiresIn: "7d"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */

// User Routes (Public - Register)
/**
 * @swagger
 * /users:
 *   post:
 *     summary: Register a new user
 *     description: Creates a new user account (public endpoint with rate limiting)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUserInput'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 201
 *               message: User created successfully
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 isActive: true
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       409:
 *         $ref: '#/components/responses/Conflict'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Users retrieved successfully
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                   isActive: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a specific user by their UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID (UUID format)
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: User retrieved successfully
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "John Doe"
 *                 email: "john@example.com"
 *                 isActive: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *
 *   put:
 *     summary: Update user
 *     description: Updates a user's information (partial updates supported)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID (UUID format)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateUserInput'
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: User updated successfully
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Jane Doe"
 *                 email: "john@example.com"
 *                 isActive: true
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 *
 *   delete:
 *     summary: Delete user
 *     description: Permanently deletes a user account
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID (UUID format)
 *     responses:
 *       204:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 204
 *               message: User deleted successfully
 *               data: {}
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */
