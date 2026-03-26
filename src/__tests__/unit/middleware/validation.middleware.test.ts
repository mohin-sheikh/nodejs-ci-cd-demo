import { Request, Response, NextFunction } from 'express';
import * as Joi from 'joi';
import {
  validate,
  validateParams,
  validateQuery,
} from '../../../api/middlewares/validation.middleware';

describe('Validation Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: jest.MockedFunction<NextFunction>;

  beforeEach(() => {
    // Setup mock request
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };

    // Setup mock response
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Setup mock next
    mockNext = jest.fn();
  });

  describe('validate', () => {
    const userSchema = Joi.object({
      name: Joi.string().min(2).max(100).required(),
      email: Joi.string().email().required(),
      age: Joi.number().min(18).max(120).optional(),
    });

    it('should call next when validation passes', async () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
      };

      const middleware = validate(userSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });

    it('should strip unknown fields from request body', async () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 25,
        unknownField: 'should be stripped',
      };

      const middleware = validate(userSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.body).not.toHaveProperty('unknownField');
      expect(mockRequest.body).toHaveProperty('name', 'John Doe');
      expect(mockRequest.body).toHaveProperty('email', 'john@example.com');
      expect(mockRequest.body).toHaveProperty('age', 25);
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 with validation errors when validation fails', async () => {
      mockRequest.body = {
        name: 'J',
        email: 'invalid-email',
      };

      const middleware = validate(userSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            message: expect.stringMatching(
              /at least 2 characters|length must be at least 2 characters long/
            ),
          }),
          expect.objectContaining({
            field: 'email',
            message: expect.stringMatching(/valid email|must be a valid email/),
          }),
        ]),
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return all validation errors (abortEarly: false)', async () => {
      mockRequest.body = {
        name: 'J',
        email: 'invalid-email',
      };

      const middleware = validate(userSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      const response = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(response.details.length).toBeGreaterThanOrEqual(2);
    });

    it('should handle optional fields correctly', async () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        // age is optional, so it's fine to omit
      };

      const middleware = validate(userSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.body).not.toHaveProperty('age');
    });

    it('should validate age range when provided', async () => {
      mockRequest.body = {
        name: 'John Doe',
        email: 'john@example.com',
        age: 15, // Below minimum
      };

      const middleware = validate(userSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.error).toBe('Validation failed');
      expect(responseCall.details[0].field).toBe('age');
      expect(responseCall.details[0].message).toMatch(/must be greater than or equal to 18/);
    });

    it('should handle nested object validation', async () => {
      const nestedSchema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required(),
      });

      mockRequest.body = {
        user: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      const middleware = validate(nestedSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('should handle nested validation errors with dot notation', async () => {
      const nestedSchema = Joi.object({
        user: Joi.object({
          name: Joi.string().required(),
          email: Joi.string().email().required(),
        }).required(),
      });

      mockRequest.body = {
        user: {
          name: '',
          email: 'invalid',
        },
      };

      const middleware = validate(nestedSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.objectContaining({
            field: 'user.name',
          }),
          expect.objectContaining({
            field: 'user.email',
          }),
        ]),
      });
    });
  });

  describe('validateParams', () => {
    const paramsSchema = Joi.object({
      id: Joi.string().uuid().required(),
      userId: Joi.string().uuid().optional(),
    });

    it('should call next when params validation passes', async () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
      };

      const middleware = validateParams(paramsSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 400 with validation errors for invalid params', async () => {
      mockRequest.params = {
        id: 'invalid-uuid',
      };

      const middleware = validateParams(paramsSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid parameters',
        details: [
          {
            field: 'id',
            message: '"id" must be a valid GUID',
          },
        ],
      });
    });

    it('should strip unknown params', async () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        unknownParam: 'should be stripped',
      };

      const middleware = validateParams(paramsSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.params).not.toHaveProperty('unknownParam');
      expect(mockRequest.params).toHaveProperty('id');
    });

    it('should handle missing required params', async () => {
      mockRequest.params = {};

      const middleware = validateParams(paramsSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.error).toBe('Invalid parameters');
      expect(responseCall.details[0].field).toBe('id');
      expect(responseCall.details[0].message).toMatch(/required/);
    });

    it('should accept valid optional params', async () => {
      mockRequest.params = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        // userId is optional, so it's fine to omit
      };

      const middleware = validateParams(paramsSchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });
  });

  describe('validateQuery', () => {
    const querySchema = Joi.object({
      page: Joi.number().min(1).default(1),
      limit: Joi.number().min(1).max(100).default(10),
      sort: Joi.string().valid('asc', 'desc').default('asc'),
      search: Joi.string().optional(),
    });

    it('should call next when query validation passes', async () => {
      mockRequest.query = {
        page: '2',
        limit: '20',
        sort: 'desc',
        search: 'john',
      };

      const middleware = validateQuery(querySchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should apply default values for missing fields', async () => {
      mockRequest.query = {};

      const middleware = validateQuery(querySchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query).toHaveProperty('page', 1);
      expect(mockRequest.query).toHaveProperty('limit', 10);
      expect(mockRequest.query).toHaveProperty('sort', 'asc');
      expect(mockNext).toHaveBeenCalled();
    });

    it('should return 400 for invalid query parameters', async () => {
      mockRequest.query = {
        page: '0',
        limit: '200',
        sort: 'invalid',
      };

      const middleware = validateQuery(querySchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      const responseCall = (mockResponse.json as jest.Mock).mock.calls[0][0];
      expect(responseCall.error).toBe('Invalid query parameters');
      expect(responseCall.details).toHaveLength(3);
    });

    it('should convert string numbers to actual numbers', async () => {
      mockRequest.query = {
        page: '2',
        limit: '15',
      };

      const middleware = validateQuery(querySchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query).toHaveProperty('page', 2);
      expect(mockRequest.query).toHaveProperty('limit', 15);
    });

    it('should strip unknown query parameters', async () => {
      mockRequest.query = {
        page: '1',
        limit: '10',
        unknownParam: 'should be stripped',
      };

      const middleware = validateQuery(querySchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockRequest.query).not.toHaveProperty('unknownParam');
    });

    it('should handle array query parameters', async () => {
      const arrayQuerySchema = Joi.object({
        ids: Joi.array().items(Joi.string().uuid()).required(),
      });

      mockRequest.query = {
        ids: ['123e4567-e89b-12d3-a456-426614174000', '123e4567-e89b-12d3-a456-426614174001'],
      };

      const middleware = validateQuery(arrayQuerySchema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockRequest.query.ids).toHaveLength(2);
    });
  });

  describe('Error Handling', () => {
    it('should call next with error when validation throws unexpected error', async () => {
      const schema = Joi.object({
        name: Joi.string().required(),
      });

      // Simulate an unexpected error by causing validation to throw
      const originalValidate = schema.validate;
      schema.validate = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected validation error');
      });

      mockRequest.body = { name: 'John' };

      const middleware = validate(schema);
      await middleware(mockRequest as Request, mockResponse as Response, mockNext);

      expect(mockNext).toHaveBeenCalledWith(new Error('Unexpected validation error'));

      // Restore original method
      schema.validate = originalValidate;
    });
  });
});
