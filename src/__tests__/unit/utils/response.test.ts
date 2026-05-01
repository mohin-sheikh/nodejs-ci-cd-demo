import { Response, Request } from 'express';
import { ResponseHandler, ValidationError } from '../../../utils/response';
import { StatusCodes } from '../../../utils/statusCodes';
import { ResponseMessages } from '../../../utils/responseMessages';

describe('ResponseHandler', () => {
  let mockResponse: Partial<Response>;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockRequest: Partial<Request>;

  beforeEach(() => {
    mockJson = jest.fn().mockReturnThis();
    mockStatus = jest.fn().mockReturnValue({ json: mockJson });

    mockRequest = {
      originalUrl: '/test',
    };

    mockResponse = {
      status: mockStatus,
      json: mockJson,
      req: mockRequest as Request,
    };
  });

  describe('success', () => {
    it('should return success response with default message and status 200', () => {
      const data = { id: 1, name: 'Test' };

      ResponseHandler.success(mockResponse as Response, data);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: ResponseMessages.SUCCESS,
        data,
      });
    });

    it('should return success response with custom message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Custom success message';

      ResponseHandler.success(mockResponse as Response, data, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message,
        data,
      });
    });
  });

  describe('error', () => {
    it('should return error response with empty data object', () => {
      const errorMessage = 'Something went wrong';

      ResponseHandler.error(mockResponse as Response, errorMessage, StatusCodes.BAD_REQUEST);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.BAD_REQUEST,
        message: errorMessage,
        data: {},
      });
    });

    it('should return error response with validation details in data', () => {
      const errorMessage = 'Validation failed';
      const details: ValidationError[] = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 6 characters' },
      ];

      ResponseHandler.error(mockResponse as Response, errorMessage, StatusCodes.BAD_REQUEST, {
        details,
      });

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.BAD_REQUEST,
        message: errorMessage,
        data: { details },
      });
    });
  });

  describe('badRequest', () => {
    it('should return bad request response with status 400', () => {
      const errorMessage = 'Invalid input';

      ResponseHandler.badRequest(mockResponse as Response, errorMessage);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.BAD_REQUEST,
        message: errorMessage,
        data: {},
      });
    });
  });

  describe('unauthorized', () => {
    it('should return unauthorized response with status 401', () => {
      ResponseHandler.unauthorized(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.UNAUTHORIZED,
        message: ResponseMessages.UNAUTHORIZED,
        data: {},
      });
    });
  });

  describe('notFound', () => {
    it('should return not found response with status 404', () => {
      ResponseHandler.notFound(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.NOT_FOUND,
        message: ResponseMessages.NOT_FOUND,
        data: {},
      });
    });
  });

  describe('conflict', () => {
    it('should return conflict response with status 409', () => {
      ResponseHandler.conflict(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.CONFLICT,
        message: ResponseMessages.USER_ALREADY_EXISTS,
        data: {},
      });
    });
  });

  describe('validationError', () => {
    it('should return validation error response with status 400', () => {
      const errorMessage = 'Validation failed';
      const details: ValidationError[] = [{ field: 'email', message: 'Email is required' }];

      ResponseHandler.validationError(mockResponse as Response, errorMessage, details);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.BAD_REQUEST,
        message: errorMessage,
        data: { details },
      });
    });
  });

  describe('paginated', () => {
    it('should return paginated response with correct pagination metadata', () => {
      const data = [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
        { id: 3, name: 'Item 3' },
      ];
      const total = 10;
      const page = 2;
      const limit = 3;

      ResponseHandler.paginated(mockResponse as Response, data, total, page, limit);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockJson).toHaveBeenCalledWith({
        statusCode: StatusCodes.OK,
        message: ResponseMessages.SUCCESS,
        data,
        pagination: {
          page: 2,
          limit: 3,
          total: 10,
          totalPages: 4,
          hasNext: true,
          hasPrev: true,
        },
      });
    });
  });
});
