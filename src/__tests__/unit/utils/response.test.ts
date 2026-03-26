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
        success: true,
        message: ResponseMessages.SUCCESS,
        statusCode: StatusCodes.OK,
        data,
      });
    });

    it('should return success response with custom message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Custom success message';

      ResponseHandler.success(mockResponse as Response, data, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message,
        statusCode: StatusCodes.OK,
        data,
      });
    });

    it('should return success response with custom status code', () => {
      const data = { id: 1, name: 'Test' };

      ResponseHandler.success(mockResponse as Response, data, 'Success', StatusCodes.ACCEPTED);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.ACCEPTED);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: 'Success',
        statusCode: StatusCodes.ACCEPTED,
        data,
      });
    });
  });

  describe('created', () => {
    it('should return created response with status 201', () => {
      const data = { id: 1, name: 'Test' };

      ResponseHandler.created(mockResponse as Response, data);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: ResponseMessages.CREATED,
        statusCode: StatusCodes.CREATED,
        data,
      });
    });

    it('should return created response with custom message', () => {
      const data = { id: 1, name: 'Test' };
      const message = 'Custom created message';

      ResponseHandler.created(mockResponse as Response, data, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CREATED);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message,
        statusCode: StatusCodes.CREATED,
        data,
      });
    });
  });

  describe('updated', () => {
    it('should return updated response with status 200', () => {
      const data = { id: 1, name: 'Updated' };

      ResponseHandler.updated(mockResponse as Response, data);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: ResponseMessages.UPDATED,
        statusCode: StatusCodes.OK,
        data,
      });
    });
  });

  describe('noContent', () => {
    it('should return no content response with status 204', () => {
      ResponseHandler.noContent(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message: ResponseMessages.DELETED,
        statusCode: StatusCodes.NO_CONTENT,
      });
    });

    it('should return no content response with custom message', () => {
      const message = 'Custom deleted message';

      ResponseHandler.noContent(mockResponse as Response, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NO_CONTENT);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message,
        statusCode: StatusCodes.NO_CONTENT,
      });
    });
  });

  describe('error', () => {
    it('should return error response with string error message', () => {
      const errorMessage = 'Something went wrong';

      ResponseHandler.error(mockResponse as Response, errorMessage);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: errorMessage,
        data: {},
      });
    });

    it('should return error response with Error object', () => {
      const error = new Error('Database connection failed');

      ResponseHandler.error(mockResponse as Response, error);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.INTERNAL_SERVER_ERROR);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: error.message,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
        error: error.message,
        data: {},
      });
    });

    it('should return error response with custom status code', () => {
      const errorMessage = 'Bad request';

      ResponseHandler.error(mockResponse as Response, errorMessage, StatusCodes.BAD_REQUEST);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
        statusCode: StatusCodes.BAD_REQUEST,
        error: errorMessage,
        data: {},
      });
    });

    it('should return error response with validation details', () => {
      const errorMessage = 'Validation failed';
      const details: ValidationError[] = [
        { field: 'email', message: 'Email is required' },
        { field: 'password', message: 'Password must be at least 6 characters' },
      ];

      ResponseHandler.error(
        mockResponse as Response,
        errorMessage,
        StatusCodes.BAD_REQUEST,
        details
      );

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
        statusCode: StatusCodes.BAD_REQUEST,
        error: errorMessage,
        data: {},
        details,
      });
    });
  });

  describe('badRequest', () => {
    it('should return bad request response with status 400', () => {
      const errorMessage = 'Invalid input';

      ResponseHandler.badRequest(mockResponse as Response, errorMessage);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
        statusCode: StatusCodes.BAD_REQUEST,
        error: errorMessage,
        data: {},
      });
    });

    it('should return bad request response with details', () => {
      const errorMessage = 'Validation failed';
      const details = { field: 'name', error: 'Name is required' };

      ResponseHandler.badRequest(mockResponse as Response, errorMessage, details);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.BAD_REQUEST);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: errorMessage,
        statusCode: StatusCodes.BAD_REQUEST,
        error: errorMessage,
        data: {},
        details,
      });
    });
  });

  describe('unauthorized', () => {
    it('should return unauthorized response with status 401', () => {
      ResponseHandler.unauthorized(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: ResponseMessages.UNAUTHORIZED,
        statusCode: StatusCodes.UNAUTHORIZED,
        error: ResponseMessages.UNAUTHORIZED,
        data: {},
      });
    });

    it('should return unauthorized response with custom message', () => {
      const message = 'Invalid token';

      ResponseHandler.unauthorized(mockResponse as Response, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.UNAUTHORIZED);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message,
        statusCode: StatusCodes.UNAUTHORIZED,
        error: message,
        data: {},
      });
    });
  });

  describe('forbidden', () => {
    it('should return forbidden response with status 403', () => {
      ResponseHandler.forbidden(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.FORBIDDEN);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: ResponseMessages.FORBIDDEN,
        statusCode: StatusCodes.FORBIDDEN,
        error: ResponseMessages.FORBIDDEN,
        data: {},
      });
    });
  });

  describe('notFound', () => {
    it('should return not found response with status 404', () => {
      ResponseHandler.notFound(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: ResponseMessages.NOT_FOUND,
        statusCode: StatusCodes.NOT_FOUND,
        error: ResponseMessages.NOT_FOUND,
        data: {},
      });
    });

    it('should return not found response with custom message', () => {
      const message = 'User not found';

      ResponseHandler.notFound(mockResponse as Response, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.NOT_FOUND);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message,
        statusCode: StatusCodes.NOT_FOUND,
        error: message,
        data: {},
      });
    });
  });

  describe('conflict', () => {
    it('should return conflict response with status 409', () => {
      ResponseHandler.conflict(mockResponse as Response);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.CONFLICT);
      expect(mockJson).toHaveBeenCalledWith({
        success: false,
        message: ResponseMessages.USER_ALREADY_EXISTS,
        statusCode: StatusCodes.CONFLICT,
        error: ResponseMessages.USER_ALREADY_EXISTS,
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
        success: false,
        message: errorMessage,
        statusCode: StatusCodes.BAD_REQUEST,
        error: errorMessage,
        data: {},
        details,
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
        success: true,
        message: ResponseMessages.SUCCESS,
        statusCode: StatusCodes.OK,
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

    it('should return paginated response with custom message', () => {
      const data = [{ id: 1, name: 'Item 1' }];
      const total = 1;
      const page = 1;
      const limit = 10;
      const message = 'Custom paginated message';

      ResponseHandler.paginated(mockResponse as Response, data, total, page, limit, message);

      expect(mockStatus).toHaveBeenCalledWith(StatusCodes.OK);
      expect(mockJson).toHaveBeenCalledWith({
        success: true,
        message,
        statusCode: StatusCodes.OK,
        data,
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNext: false,
          hasPrev: false,
        },
      });
    });

    it('should calculate pagination correctly for first page', () => {
      const data = [{ id: 1, name: 'Item 1' }];
      const total = 5;
      const page = 1;
      const limit = 10;

      ResponseHandler.paginated(mockResponse as Response, data, total, page, limit);

      const call = mockJson.mock.calls[0][0];
      expect(call.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 5,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      });
    });

    it('should calculate pagination correctly for last page', () => {
      const data = [{ id: 10, name: 'Item 10' }];
      const total = 10;
      const page = 2;
      const limit = 5;

      ResponseHandler.paginated(mockResponse as Response, data, total, page, limit);

      const call = mockJson.mock.calls[0][0];
      expect(call.pagination).toEqual({
        page: 2,
        limit: 5,
        total: 10,
        totalPages: 2,
        hasNext: false,
        hasPrev: true,
      });
    });
  });
});
