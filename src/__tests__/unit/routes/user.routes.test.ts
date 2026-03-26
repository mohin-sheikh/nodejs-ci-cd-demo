import { Request, Response, NextFunction } from 'express';

jest.mock('../../../api/controllers/user.controller', () => ({
  UserController: jest.fn().mockImplementation(() => ({
    getAllUsers: jest.fn(),
    getUserById: jest.fn(),
    createUser: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  })),
}));

jest.mock('../../../api/middlewares/validation.middleware', () => ({
  validate: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
  validateParams: jest.fn(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

jest.mock('../../../validators/user.validator', () => ({
  createUserSchema: {},
  updateUserSchema: {},
  userIdSchema: {},
}));

import router from '../../../api/routes/user.routes';

interface RouteLayer {
  route?: {
    path: string;
    methods?: {
      get?: boolean;
      post?: boolean;
      put?: boolean;
      delete?: boolean;
    };
  };
}

describe('User Routes', () => {
  it('should export a Router instance', () => {
    expect(router).toBeDefined();
    expect(router.stack).toBeDefined();
  });

  it('should have GET / endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasGetRoute = routes?.some((layer) => {
      return layer.route?.path === '/' && layer.route?.methods?.get;
    });
    expect(hasGetRoute).toBe(true);
  });

  it('should have POST / endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasPostRoute = routes?.some((layer) => {
      return layer.route?.path === '/' && layer.route?.methods?.post;
    });
    expect(hasPostRoute).toBe(true);
  });

  it('should have GET /:id endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasGetByIdRoute = routes?.some((layer) => {
      return layer.route?.path === '/:id' && layer.route?.methods?.get;
    });
    expect(hasGetByIdRoute).toBe(true);
  });

  it('should have PUT /:id endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasPutRoute = routes?.some((layer) => {
      return layer.route?.path === '/:id' && layer.route?.methods?.put;
    });
    expect(hasPutRoute).toBe(true);
  });

  it('should have DELETE /:id endpoint', () => {
    const routes = router.stack as RouteLayer[];
    const hasDeleteRoute = routes?.some((layer) => {
      return layer.route?.path === '/:id' && layer.route?.methods?.delete;
    });
    expect(hasDeleteRoute).toBe(true);
  });
});
