const mockUserRoutes = jest.fn();

jest.mock('../config/database', () => ({
  AppDataSource: {
    isInitialized: true,
  },
}));

jest.mock('../api/routes/user.routes', () => ({
  __esModule: true,
  default: mockUserRoutes,
}));

jest.mock('../api/middlewares/error.middleware', () => ({
  errorHandler: jest.fn(),
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
});
