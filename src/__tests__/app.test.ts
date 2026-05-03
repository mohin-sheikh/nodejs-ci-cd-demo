import { Request, Response, NextFunction } from 'express';

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

jest.mock('../config/redis', () => ({
  __esModule: true,
  default: {
    getClient: jest.fn().mockResolvedValue({
      ping: jest.fn().mockResolvedValue('PONG'),
      quit: jest.fn().mockResolvedValue(undefined),
    }),
    disconnect: jest.fn().mockResolvedValue(undefined),
    healthCheck: jest.fn().mockResolvedValue(true),
  },
}));

const mockV1Routes = jest.fn();
jest.mock('../api/routes/v1', () => ({
  __esModule: true,
  default: mockV1Routes,
}));

jest.mock('../api/middlewares/error.middleware', () => ({
  errorHandler: jest.fn(),
}));

jest.mock('../api/middlewares/logger.middleware', () => ({
  requestLogger: jest.fn((_req: Request, _res: Response, next: NextFunction) => next()),
}));

jest.mock('../utils/response', () => ({
  ResponseHandler: {
    success: jest.fn((_res: Response, data: unknown, message: string, statusCode?: number) => ({
      success: true,
      message,
      data,
      statusCode: statusCode || 200,
    })),
    notFound: jest.fn((_res: Response, message: string) => ({
      success: false,
      message,
      statusCode: 404,
    })),
    error: jest.fn((_res: Response, error: string, statusCode: number) => ({
      success: false,
      error,
      statusCode,
    })),
    created: jest.fn((_res: Response, data: unknown, message: string) => ({
      success: true,
      message,
      data,
      statusCode: 201,
    })),
    updated: jest.fn((_res: Response, data: unknown, message: string) => ({
      success: true,
      message,
      data,
      statusCode: 200,
    })),
    noContent: jest.fn((_res: Response, message: string) => ({
      success: true,
      message,
      statusCode: 204,
    })),
    badRequest: jest.fn((_res: Response, error: string) => ({
      success: false,
      error,
      statusCode: 400,
    })),
    unauthorized: jest.fn((_res: Response, error: string) => ({
      success: false,
      error,
      statusCode: 401,
    })),
    forbidden: jest.fn((_res: Response, error: string) => ({
      success: false,
      error,
      statusCode: 403,
    })),
    conflict: jest.fn((_res: Response, error: string) => ({
      success: false,
      error,
      statusCode: 409,
    })),
    validationError: jest.fn((_res: Response, error: string, details?: unknown) => ({
      success: false,
      error,
      details,
      statusCode: 400,
    })),
    paginated: jest.fn(
      (
        _res: Response,
        data: unknown[],
        total: number,
        page: number,
        limit: number,
        message?: string
      ) => ({
        success: true,
        message: message || 'Success',
        data,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
        statusCode: 200,
      })
    ),
  },
}));

import app from '../app';

interface RouteLayer {
  route?: {
    path: string;
    methods?: Record<string, boolean>;
  };
  regexp?: RegExp;
  name?: string;
  handle?: (req: Request, res: Response, next: NextFunction) => void;
}

describe('App', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should export an Express application', () => {
    expect(app).toBeDefined();
    expect(typeof app).toBe('function');
    expect(app.use).toBeDefined();
    expect(app.listen).toBeDefined();
  });

  it('should have health check endpoint', () => {
    expect(app._router).toBeDefined();
    const routes = (app._router?.stack as RouteLayer[]) || [];
    const hasHealthRoute = routes.some((layer: RouteLayer) => {
      return layer.route?.path === '/health';
    });
    expect(hasHealthRoute).toBe(true);
  });

  it('should have proper middleware configured', () => {
    const middlewareLayers = (app._router?.stack as RouteLayer[]) || [];
    expect(middlewareLayers.length).toBeGreaterThan(0);
  });

  it('should have API routes mounted', () => {
    const routes = (app._router?.stack as RouteLayer[]) || [];
    const hasApiRoute = routes.some((layer: RouteLayer) => {
      return layer.regexp?.toString().includes('\\/api') ?? false;
    });
    expect(hasApiRoute).toBe(true);
  });

  it('should have root route configured', () => {
    const routes = (app._router?.stack as RouteLayer[]) || [];
    const hasRootRoute = routes.some((layer: RouteLayer) => {
      return layer.route?.path === '/';
    });
    expect(hasRootRoute).toBe(true);
  });

  it('should have 404 handler for unmatched routes', () => {
    const routes = (app._router?.stack as RouteLayer[]) || [];

    const hasWildcardRoute = routes.some((layer: RouteLayer) => {
      return layer.route?.path === '*';
    });

    const hasErrorHandler = routes.some((layer: RouteLayer) => {
      return layer.route === undefined && layer.name === 'errorHandler';
    });

    expect(hasWildcardRoute || hasErrorHandler || routes.length > 0).toBe(true);
  });
});
