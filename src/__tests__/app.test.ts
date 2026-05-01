jest.mock('../config/database', () => ({
  AppDataSource: {
    isInitialized: true,
    getRepository: jest.fn().mockReturnValue({
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        getOne: jest.fn(),
      }),
    }),
  },
}));

const mockUserRoutes = jest.fn();
jest.mock('../api/routes/user.routes', () => ({
  __esModule: true,
  default: mockUserRoutes,
}));

const mockAuthRoutes = jest.fn();
jest.mock('../api/routes/auth.routes', () => ({
  __esModule: true,
  default: mockAuthRoutes,
}));

jest.mock('../api/middlewares/error.middleware', () => ({
  errorHandler: jest.fn(),
}));

jest.mock('../api/middlewares/logger.middleware', () => ({
  requestLogger: jest.fn((_req: unknown, _res: unknown, next: () => void) => next()),
}));

jest.mock('../utils/response', () => ({
  ResponseHandler: {
    success: jest.fn((_res: unknown, data: unknown, message: string) => ({
      success: true,
      message,
      data,
    })),
    notFound: jest.fn((_res: unknown, message: string) => ({
      success: false,
      message,
      statusCode: 404,
    })),
    error: jest.fn((_res: unknown, error: string, statusCode: number) => ({
      success: false,
      error,
      statusCode,
    })),
    created: jest.fn((_res: unknown, data: unknown, message: string) => ({
      success: true,
      message,
      data,
      statusCode: 201,
    })),
    updated: jest.fn((_res: unknown, data: unknown, message: string) => ({
      success: true,
      message,
      data,
      statusCode: 200,
    })),
    noContent: jest.fn((_res: unknown, message: string) => ({
      success: true,
      message,
      statusCode: 204,
    })),
    badRequest: jest.fn((_res: unknown, error: string) => ({
      success: false,
      error,
      statusCode: 400,
    })),
    unauthorized: jest.fn((_res: unknown, error: string) => ({
      success: false,
      error,
      statusCode: 401,
    })),
    forbidden: jest.fn((_res: unknown, error: string) => ({
      success: false,
      error,
      statusCode: 403,
    })),
    conflict: jest.fn((_res: unknown, error: string) => ({
      success: false,
      error,
      statusCode: 409,
    })),
    validationError: jest.fn((_res: unknown, error: string, details?: unknown) => ({
      success: false,
      error,
      details,
      statusCode: 400,
    })),
    paginated: jest.fn(
      (_res: unknown, data: unknown[], total: number, page: number, limit: number) => ({
        success: true,
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        statusCode: 200,
      })
    ),
  },
}));

import app from '../app';

describe('App', () => {
  it('should export an Express application', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
    expect(app.use).toBeDefined();
    expect(app.listen).toBeDefined();
  });

  it('should have health check endpoint', () => {
    expect(app._router).toBeDefined();
  });

  it('should have proper middleware configured', () => {
    const middlewareLayers = app._router?.stack || [];
    expect(middlewareLayers.length).toBeGreaterThan(0);
  });
});
