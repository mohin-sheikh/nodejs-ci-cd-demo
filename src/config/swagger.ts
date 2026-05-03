import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Node.js TypeScript CI/CD Demo API',
    version: '1.0.0',
    description: `
    A production-ready Node.js TypeScript application with JWT authentication, PostgreSQL database, Redis caching, and comprehensive CI/CD pipeline.
    
    ## API Versioning
    
    This API uses versioning with the prefix \`/v1\`. All endpoints are accessible under:
    - \`http://localhost:3000/api/v1/\`
    - Legacy support: \`http://localhost:3000/api/\` (redirects to v1)
    
    ## Rate Limiting
    
    This API implements three levels of rate limiting:
    
    | Limiter | Window | Max Requests | Endpoints |
    |---------|--------|--------------|-----------|
    | Login | 15 minutes | 5 | POST /api/v1/auth/login |
    | API | 1 minute | 100 | GET /api/v1/users, GET /api/v1/users/:id, PUT /api/v1/users/:id |
    | Strict | 1 hour | 10 | POST /api/v1/users, DELETE /api/v1/users/:id |
    
    Rate limit information is returned in response headers:
    - \`X-RateLimit-Limit\`: Maximum requests allowed
    - \`X-RateLimit-Remaining\`: Remaining requests
    - \`X-RateLimit-Reset\`: Reset timestamp
    
    ## Authentication
    
    Most endpoints require JWT authentication. To authenticate:
    1. Call \`POST /api/v1/auth/login\` to obtain access and refresh tokens
    2. Include the access token in the \`Authorization\` header: \`Bearer <access_token>\`
    3. When the access token expires, use \`POST /api/v1/auth/refresh\` with the refresh token
    
    ## Password Requirements
    
    - Minimum 8 characters
    - Maximum 128 characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character (@$!%*?&)
    `,
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
    contact: {
      name: 'Mohin Sheikh (Github)',
      url: 'https://github.com/mohin-sheikh',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000/api/v1',
      description: 'Development Server (Version 1)',
    },
    {
      url: 'http://localhost:3000/api',
      description: 'Development Server (Legacy - redirects to v1)',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT access token',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 400 },
          message: { type: 'string', example: 'Validation failed' },
          data: {
            type: 'object',
            properties: {
              details: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    field: { type: 'string' },
                    message: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer', example: 200 },
          message: { type: 'string', example: 'Success' },
          data: { type: 'object' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '123e4567-e89b-12d3-a456-426614174000' },
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          isActive: { type: 'boolean', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            description: 'Must contain uppercase, lowercase, number, and special character',
            example: 'Test@123456',
          },
          isActive: { type: 'boolean', default: true },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string', minLength: 2, maxLength: 100, example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: {
            type: 'string',
            minLength: 8,
            maxLength: 128,
            example: 'NewTest@123456',
          },
          isActive: { type: 'boolean', example: false },
        },
      },
      LoginInput: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'Test@123456' },
        },
      },
      RefreshTokenInput: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string', description: 'Valid refresh token' },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string', description: 'JWT access token (expires in 7 days)' },
          refreshToken: { type: 'string', description: 'JWT refresh token (expires in 30 days)' },
          expiresIn: { type: 'string', example: '7d' },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          tokens: { $ref: '#/components/schemas/Tokens' },
        },
      },
      Session: {
        type: 'object',
        properties: {
          tokenId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
          userAgent: { type: 'string' },
          ipAddress: { type: 'string' },
        },
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['OK', 'DEGRADED'], example: 'OK' },
          environment: { type: 'string', enum: ['development', 'production', 'test'] },
          database: { type: 'string', enum: ['connected', 'disconnected'] },
          redis: { type: 'string', enum: ['connected', 'disconnected'] },
        },
      },
    },
    parameters: {
      userIdParam: {
        name: 'id',
        in: 'path',
        required: true,
        schema: { type: 'string', format: 'uuid' },
        description: 'User ID (UUID format)',
      },
    },
    responses: {
      Unauthorized: {
        description: 'Missing or invalid authentication token',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              statusCode: 401,
              message: 'No token provided. Please login first.',
              data: {},
            },
          },
        },
      },
      NotFound: {
        description: 'Resource not found',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              statusCode: 404,
              message: 'User not found',
              data: {},
            },
          },
        },
      },
      ValidationError: {
        description: 'Request validation failed',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              statusCode: 400,
              message: 'Validation failed',
              data: {
                details: [
                  { field: 'email', message: 'Email is required' },
                  { field: 'password', message: 'Password must be at least 8 characters' },
                ],
              },
            },
          },
        },
      },
      TooManyRequests: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              statusCode: 429,
              message: 'Too many requests. Please try again in 45 seconds.',
              data: {},
            },
          },
        },
      },
      Conflict: {
        description: 'Resource conflict (e.g., duplicate email)',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' },
            example: {
              statusCode: 409,
              message: 'User with this email already exists',
              data: {},
            },
          },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Check API health status',
        tags: ['Health'],
        responses: {
          200: {
            description: 'All services are healthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Health check passed',
                  data: {
                    status: 'OK',
                    environment: 'development',
                    database: 'connected',
                    redis: 'connected',
                  },
                },
              },
            },
          },
          503: {
            description: 'Some services are unhealthy',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 503,
                  message: 'Health check passed',
                  data: {
                    status: 'DEGRADED',
                    environment: 'development',
                    database: 'connected',
                    redis: 'disconnected',
                  },
                },
              },
            },
          },
        },
      },
    },
    '/': {
      get: {
        summary: 'API welcome message',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Welcome message',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'API is running',
                  data: { message: 'Welcome to Node.js TypeScript CI/CD Demo API' },
                },
              },
            },
          },
        },
      },
    },
    '/auth/login': {
      post: {
        summary: 'User login',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Login successful',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Login successful',
                  data: {
                    user: {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      name: 'John Doe',
                      email: 'john@example.com',
                      isActive: true,
                      createdAt: '2024-01-01T00:00:00.000Z',
                      updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                    tokens: {
                      accessToken: 'eyJhbGciOiJIUzI1NiIs...',
                      refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
                      expiresIn: '7d',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          400: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/auth/refresh': {
      post: {
        summary: 'Refresh access token',
        tags: ['Authentication'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshTokenInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'Token refreshed successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Token refreshed successfully',
                  data: {
                    tokens: {
                      accessToken: 'eyJhbGciOiJIUzI1NiIs...',
                      refreshToken: 'eyJhbGciOiJIUzI1NiIs...',
                      expiresIn: '7d',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          400: { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/auth/me': {
      get: {
        summary: 'Get current user',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Current user retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Current user retrieved',
                  data: {
                    user: {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      email: 'john@example.com',
                      name: 'John Doe',
                    },
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout': {
      post: {
        summary: 'Logout current session',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Logged out successfully',
                  data: {},
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/logout-all': {
      post: {
        summary: 'Logout from all devices',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Logged out from all devices successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Logged out from all devices successfully',
                  data: {},
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/auth/sessions': {
      get: {
        summary: 'Get active sessions',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Active sessions retrieved',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Active sessions retrieved',
                  data: {
                    sessions: [
                      {
                        tokenId: 'abc123...',
                        createdAt: '2024-01-01T00:00:00.000Z',
                      },
                    ],
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
        },
      },
    },
    '/users': {
      post: {
        summary: 'Register a new user',
        tags: ['Users'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateUserInput' },
            },
          },
        },
        responses: {
          201: {
            description: 'User created successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 201,
                  message: 'User created successfully',
                  data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'John Doe',
                    email: 'john@example.com',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                  },
                },
              },
            },
          },
          400: { $ref: '#/components/responses/ValidationError' },
          409: { $ref: '#/components/responses/Conflict' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: 'Users retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'Users retrieved successfully',
                  data: [
                    {
                      id: '123e4567-e89b-12d3-a456-426614174000',
                      name: 'John Doe',
                      email: 'john@example.com',
                      isActive: true,
                      createdAt: '2024-01-01T00:00:00.000Z',
                      updatedAt: '2024-01-01T00:00:00.000Z',
                    },
                  ],
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
    '/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/userIdParam' }],
        responses: {
          200: {
            description: 'User retrieved successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'User retrieved successfully',
                  data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'John Doe',
                    email: 'john@example.com',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:00.000Z',
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      put: {
        summary: 'Update user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/userIdParam' }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          200: {
            description: 'User updated successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 200,
                  message: 'User updated successfully',
                  data: {
                    id: '123e4567-e89b-12d3-a456-426614174000',
                    name: 'Jane Doe',
                    email: 'john@example.com',
                    isActive: true,
                    createdAt: '2024-01-01T00:00:00.000Z',
                    updatedAt: '2024-01-01T00:00:01.000Z',
                  },
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          400: { $ref: '#/components/responses/ValidationError' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
      delete: {
        summary: 'Delete user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [{ $ref: '#/components/parameters/userIdParam' }],
        responses: {
          204: {
            description: 'User deleted successfully',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SuccessResponse' },
                example: {
                  statusCode: 204,
                  message: 'User deleted successfully',
                  data: {},
                },
              },
            },
          },
          401: { $ref: '#/components/responses/Unauthorized' },
          404: { $ref: '#/components/responses/NotFound' },
          429: { $ref: '#/components/responses/TooManyRequests' },
        },
      },
    },
  },
};

export const setupSwagger = (app: Express): void => {
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'Node.js TypeScript CI/CD Demo API Documentation',
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    })
  );

  // Serve Swagger JSON
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('Swagger documentation available at /api-docs');
};
