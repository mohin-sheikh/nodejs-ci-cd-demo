import { Router, Request, Response, NextFunction } from 'express';
import v1Router from '../../../../api/routes/v1';

jest.mock('../../../../api/routes/v1/user.routes', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../../../../api/routes/v1/auth.routes', () => ({
  __esModule: true,
  default: jest.fn(),
}));

interface RouteLayer {
  route?: {
    path: string;
    methods?: Record<string, boolean>;
  };
  name?: string;
  regexp?: RegExp;
  handle?: Router | ((req: Request, res: Response, next: NextFunction) => void);
}

describe('V1 Routes Index', () => {
  it('should export a Router instance', () => {
    expect(v1Router).toBeDefined();
    expect(v1Router.stack).toBeDefined();
    expect(Array.isArray(v1Router.stack)).toBe(true);
  });

  it('should mount user routes at /users path', () => {
    const routes = v1Router.stack as RouteLayer[];

    const hasUserRoute = routes.some((layer: RouteLayer) => {
      return layer.regexp?.toString().includes('\\/users') ?? false;
    });

    expect(hasUserRoute).toBe(true);
  });

  it('should mount auth routes at /auth path', () => {
    const routes = v1Router.stack as RouteLayer[];

    const hasAuthRoute = routes.some((layer: RouteLayer) => {
      return layer.regexp?.toString().includes('\\/auth') ?? false;
    });

    expect(hasAuthRoute).toBe(true);
  });

  it('should have exactly 2 route layers (users and auth)', () => {
    const routes = v1Router.stack as RouteLayer[];
    const routeLayers = routes.filter((layer: RouteLayer) => {
      return (
        layer.regexp &&
        (layer.regexp.toString().includes('\\/users') ||
          layer.regexp.toString().includes('\\/auth'))
      );
    });

    expect(routeLayers).toHaveLength(2);
  });

  it('should mount routes in correct order (users before auth)', () => {
    const routes = v1Router.stack as RouteLayer[];
    const routePaths = routes
      .filter((layer: RouteLayer) => {
        return (
          layer.regexp &&
          (layer.regexp.toString().includes('\\/users') ||
            layer.regexp.toString().includes('\\/auth'))
        );
      })
      .map((layer: RouteLayer) => {
        if (layer.regexp?.toString().includes('\\/users')) return '/users';
        if (layer.regexp?.toString().includes('\\/auth')) return '/auth';
        return '';
      });

    expect(routePaths[0]).toBe('/users');
    expect(routePaths[1]).toBe('/auth');
  });
});
