import { Request, Response, NextFunction } from 'express';

jest.mock('../../../api/controllers/auth.controller', () => ({
  AuthController: jest.fn().mockImplementation(() => ({
    login: jest.fn(),
    refreshToken: jest.fn(),
    logout: jest.fn(),
    logoutAllDevices: jest.fn(),
    getActiveSessions: jest.fn(),
    getCurrentUser: jest.fn(),
  })),
}));

jest.mock('../../../api/middlewares/validation.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  validateParams: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  validateQuery: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

jest.mock('../../../api/middlewares/auth.middleware', () => ({
  authenticate: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  optionalAuth: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  requireActiveUser: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
}));

jest.mock('../../../api/middlewares/rateLimit.middleware', () => ({
  loginRateLimit: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  apiRateLimit: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
  strictRateLimit: jest.fn((req: Request, res: Response, next: NextFunction) => next()),
}));

jest.mock('../../../validators/auth.validator', () => ({
  loginSchema: {},
  refreshTokenSchema: {},
}));

import router from '../../../api/routes/v1/auth.routes';

interface RouteLayer {
  route?: {
    path: string;
    methods?: {
      get?: boolean;
      post?: boolean;
    };
  };
}

describe('Auth Routes (v1)', () => {
  it('should export a Router instance', () => {
    expect(router).toBeDefined();
    expect(router.stack).toBeDefined();
  });

  it('should have POST /login endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasPostRoute = routes?.some((layer) => {
      return layer.route?.path === '/login' && layer.route?.methods?.post;
    });
    expect(hasPostRoute).toBe(true);
  });

  it('should have POST /refresh endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasPostRoute = routes?.some((layer) => {
      return layer.route?.path === '/refresh' && layer.route?.methods?.post;
    });
    expect(hasPostRoute).toBe(true);
  });

  it('should have POST /logout endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasPostRoute = routes?.some((layer) => {
      return layer.route?.path === '/logout' && layer.route?.methods?.post;
    });
    expect(hasPostRoute).toBe(true);
  });

  it('should have POST /logout-all endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasPostRoute = routes?.some((layer) => {
      return layer.route?.path === '/logout-all' && layer.route?.methods?.post;
    });
    expect(hasPostRoute).toBe(true);
  });

  it('should have GET /sessions endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasGetRoute = routes?.some((layer) => {
      return layer.route?.path === '/sessions' && layer.route?.methods?.get;
    });
    expect(hasGetRoute).toBe(true);
  });

  it('should have GET /me endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasGetRoute = routes?.some((layer) => {
      return layer.route?.path === '/me' && layer.route?.methods?.get;
    });
    expect(hasGetRoute).toBe(true);
  });

  it('should have correct number of routes', () => {
    const routes = router.stack as RouteLayer[];
    const routeLayers = routes?.filter((layer) => layer.route);
    expect(routeLayers?.length).toBe(6);
  });
});
