/**
 * @swagger
 * components:
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
 *     Forbidden:
 *       description: Authenticated but not authorized
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 403
 *             message: Access forbidden
 *             data: {}
 *
 *     NotFound:
 *       description: Resource not found
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ErrorResponse'
 *           example:
 *             statusCode: 404
 *             message: User not found
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

// Authentication Routes
/**
 * @swagger
 * /api/auth/login:
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

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     description: Obtains a new access token using a valid refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefreshTokenInput'
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Token refreshed successfully
 *               data:
 *                 tokens:
 *                   accessToken: "eyJhbGciOiJIUzI1NiIs..."
 *                   refreshToken: "eyJhbGciOiJIUzI1NiIs..."
 *                   expiresIn: "7d"
 *       400:
 *         description: Refresh token is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Invalid or expired refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user
 *     description: Returns the profile of the currently authenticated user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Current user retrieved
 *               data:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   email: "john@example.com"
 *                   name: "John Doe"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout current session
 *     description: Invalidates the current access and refresh tokens
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Logged out successfully
 *               data: {}
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Invalidates all sessions for the current user across all devices
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out from all devices successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Logged out from all devices successfully
 *               data: {}
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

/**
 * @swagger
 * /api/auth/sessions:
 *   get:
 *     summary: Get active sessions
 *     description: Returns all active sessions for the current user
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Active sessions retrieved
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               statusCode: 200
 *               message: Active sessions retrieved
 *               data:
 *                 sessions:
 *                   - tokenId: "abc123..."
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */

// User Routes (Public - Register)
/**
 * @swagger
 * /api/users:
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
 */

// User Routes (Protected)
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Returns a list of all users (requires authentication)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/pageQuery'
 *       - $ref: '#/components/parameters/limitQuery'
 *       - $ref: '#/components/parameters/sortQuery'
 *       - $ref: '#/components/parameters/searchQuery'
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PaginatedUsersResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       429:
 *         $ref: '#/components/responses/TooManyRequests'
 */

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     description: Returns a specific user by their UUID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/userIdParam'
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
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:00.000Z"
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
 *       - $ref: '#/components/parameters/userIdParam'
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
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-01T00:00:01.000Z"
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
 *       - $ref: '#/components/parameters/userIdParam'
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

// OpenAPI Info Extension
/**
 * @swagger
 * openapi: 3.0.0
 * info:
 *   title: Node.js TypeScript CI/CD Demo API
 *   version: 1.0.0
 *   description: |
 *     ## Rate Limiting
 *
 *     This API implements three levels of rate limiting:
 *
 *     | Limiter | Window | Max Requests | Endpoints |
 *     |---------|--------|--------------|-----------|
 *     | Login | 15 minutes | 5 | POST /api/auth/login |
 *     | API | 1 minute | 100 | GET /api/users, GET /api/users/:id, PUT /api/users/:id |
 *     | Strict | 1 hour | 10 | POST /api/users, DELETE /api/users/:id |
 *
 *     Rate limit information is returned in response headers:
 *     - `X-RateLimit-Limit`: Maximum requests allowed
 *     - `X-RateLimit-Remaining`: Remaining requests
 *     - `X-RateLimit-Reset`: Reset timestamp
 *
 *     ## Authentication
 *
 *     Most endpoints require JWT authentication. To authenticate:
 *     1. Call `POST /api/auth/login` to obtain access and refresh tokens
 *     2. Include the access token in the `Authorization` header: `Bearer <access_token>`
 *     3. When the access token expires, use `POST /api/auth/refresh` with the refresh token
 *
 *     ## Password Requirements
 *
 *     - Minimum 8 characters
 *     - Maximum 128 characters
 *     - At least one uppercase letter
 *     - At least one lowercase letter
 *     - At least one number
 *     - At least one special character (@$!%*?&)
 */
