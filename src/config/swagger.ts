import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

export const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Node.js TypeScript CI/CD Demo API',
    version: '1.0.0',
    description:
      'API with JWT auth, PostgreSQL, Redis, and CI/CD pipeline. Versioned endpoints under /api/v1',
    license: {
      name: 'MIT',
    },
    contact: {
      name: 'Mohin Sheikh',
      url: 'https://github.com/mohin-sheikh',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development Server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      SuccessResponse: {
        type: 'object',
        properties: {
          statusCode: { type: 'integer' },
          message: { type: 'string' },
          data: { type: 'object' },
        },
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          isActive: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CreateUserInput: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'John Doe' },
          email: { type: 'string', format: 'email', example: 'john@example.com' },
          password: { type: 'string', example: 'Test@123456' },
          isActive: { type: 'boolean', default: true },
        },
      },
      UpdateUserInput: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Jane Doe' },
          email: { type: 'string', format: 'email', example: 'jane@example.com' },
          password: { type: 'string', example: 'NewTest@123456' },
          isActive: { type: 'boolean' },
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
          refreshToken: { type: 'string' },
        },
      },
      Tokens: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
          expiresIn: { type: 'string' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: { description: 'OK' },
          503: { description: 'Service Unavailable' },
        },
      },
    },
    '/': {
      get: {
        summary: 'Welcome',
        tags: ['Health'],
        responses: {
          200: { description: 'OK' },
        },
      },
    },
    '/api/v1/auth/login': {
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
          200: { description: 'Login successful' },
          401: { description: 'Invalid credentials' },
          429: { description: 'Too many requests' },
        },
      },
    },
    '/api/v1/auth/refresh': {
      post: {
        summary: 'Refresh token',
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
          200: { description: 'Token refreshed' },
          401: { description: 'Invalid token' },
        },
      },
    },
    '/api/v1/auth/me': {
      get: {
        summary: 'Get current user',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/auth/logout': {
      post: {
        summary: 'Logout',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'Logged out' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/auth/sessions': {
      get: {
        summary: 'Get active sessions',
        tags: ['Authentication'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/users': {
      post: {
        summary: 'Register user',
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
          201: { description: 'Created' },
          400: { description: 'Validation error' },
          409: { description: 'Email exists' },
        },
      },
      get: {
        summary: 'Get all users',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        responses: {
          200: { description: 'OK' },
          401: { description: 'Unauthorized' },
        },
      },
    },
    '/api/v1/users/{id}': {
      get: {
        summary: 'Get user by ID',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: { description: 'OK' },
          404: { description: 'Not found' },
        },
      },
      put: {
        summary: 'Update user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/UpdateUserInput' },
            },
          },
        },
        responses: {
          200: { description: 'Updated' },
          404: { description: 'Not found' },
        },
      },
      delete: {
        summary: 'Delete user',
        tags: ['Users'],
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          204: { description: 'Deleted' },
          404: { description: 'Not found' },
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
      customSiteTitle: 'Node.js TypeScript CI/CD Demo API',
    })
  );

  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
};
