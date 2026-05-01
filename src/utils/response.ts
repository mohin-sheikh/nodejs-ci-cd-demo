import { Response } from 'express';
import { StatusCodes } from './statusCodes';
import { ResponseMessages } from './responseMessages';

export interface ValidationError {
  field: string;
  message: string;
}

export type DetailsType = ValidationError[] | Record<string, unknown>;

export interface ApiResponse<T = Record<string, unknown>> {
  statusCode: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export class ResponseHandler {
  static success<T = Record<string, unknown>>(
    res: Response,
    data: T,
    message: string = ResponseMessages.SUCCESS,
    statusCode: number = StatusCodes.OK
  ): Response {
    const response: ApiResponse<T> = {
      statusCode,
      message,
      data,
    };
    return res.status(statusCode).json(response);
  }

  static created<T = Record<string, unknown>>(
    res: Response,
    data: T,
    message: string = ResponseMessages.CREATED
  ): Response {
    return this.success(res, data, message, StatusCodes.CREATED);
  }

  static updated<T = Record<string, unknown>>(
    res: Response,
    data: T,
    message: string = ResponseMessages.UPDATED
  ): Response {
    return this.success(res, data, message, StatusCodes.OK);
  }

  static noContent(res: Response, message: string = ResponseMessages.DELETED): Response {
    const response: ApiResponse = {
      statusCode: StatusCodes.NO_CONTENT,
      message,
      data: {},
    };
    return res.status(StatusCodes.NO_CONTENT).json(response);
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    data?: Record<string, unknown>
  ): Response {
    const response: ApiResponse = {
      statusCode,
      message,
      data: data || {},
    };
    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, message: string, data?: Record<string, unknown>): Response {
    return this.error(res, message, StatusCodes.BAD_REQUEST, data);
  }

  static unauthorized(res: Response, message: string = ResponseMessages.UNAUTHORIZED): Response {
    return this.error(res, message, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(res: Response, message: string = ResponseMessages.FORBIDDEN): Response {
    return this.error(res, message, StatusCodes.FORBIDDEN);
  }

  static notFound(res: Response, message: string = ResponseMessages.NOT_FOUND): Response {
    return this.error(res, message, StatusCodes.NOT_FOUND);
  }

  static conflict(res: Response, message: string = ResponseMessages.USER_ALREADY_EXISTS): Response {
    return this.error(res, message, StatusCodes.CONFLICT);
  }

  static validationError(res: Response, message: string, details?: ValidationError[]): Response {
    return this.error(res, message, StatusCodes.BAD_REQUEST, { details });
  }

  static paginated<T = Record<string, unknown>>(
    res: Response,
    data: T[],
    total: number,
    page: number,
    limit: number,
    message: string = ResponseMessages.SUCCESS
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    const response: PaginatedResponse<T> = {
      statusCode: StatusCodes.OK,
      message,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext,
        hasPrev,
      },
    };
    return res.status(StatusCodes.OK).json(response);
  }
}
