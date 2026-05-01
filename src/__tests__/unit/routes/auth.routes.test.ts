import { Request, Response, NextFunction } from 'express';

jest.mock('../../../api/controllers/auth.controller', () => ({
  AuthController: jest.fn().mockImplementation(() => ({
    login: jest.fn(),
  })),
}));

jest.mock('../../../api/middlewares/validation.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

jest.mock('../../../validators/auth.validator', () => ({
  loginSchema: {},
}));

import router from '../../../api/routes/auth.routes';

interface RouteLayer {
  route?: {
    path: string;
    methods?: {
      post?: boolean;
    };
  };
}

describe('Auth Routes', () => {
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
});
