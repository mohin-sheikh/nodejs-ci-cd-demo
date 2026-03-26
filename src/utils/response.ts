import { Response } from 'express';
import { StatusCodes } from './statusCodes';
import { ResponseMessages } from './responseMessages';

export interface ValidationError {
  field: string;
  message: string;
}

export type DetailsType = ValidationError[] | Record<string, unknown>;

export interface ApiResponse<T = Record<string, unknown>> {
  success: boolean;
  message: string;
  statusCode: number;
  data?: T;
  error?: string;
  details?: DetailsType;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
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
      success: true,
      message,
      statusCode,
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
      success: true,
      message,
      statusCode: StatusCodes.NO_CONTENT,
    };
    return res.status(StatusCodes.NO_CONTENT).json(response);
  }

  static error(
    res: Response,
    error: string | Error,
    statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
    details?: DetailsType
  ): Response {
    const errorMessage = error instanceof Error ? error.message : error;

    const response: ApiResponse = {
      success: false,
      message: errorMessage,
      statusCode,
      error: errorMessage,
      data: {},
    };

    if (details) {
      response.details = details;
    }

    return res.status(statusCode).json(response);
  }

  static badRequest(res: Response, error: string, details?: DetailsType): Response {
    return this.error(res, error, StatusCodes.BAD_REQUEST, details);
  }

  static unauthorized(res: Response, error: string = ResponseMessages.UNAUTHORIZED): Response {
    return this.error(res, error, StatusCodes.UNAUTHORIZED);
  }

  static forbidden(res: Response, error: string = ResponseMessages.FORBIDDEN): Response {
    return this.error(res, error, StatusCodes.FORBIDDEN);
  }

  static notFound(res: Response, error: string = ResponseMessages.NOT_FOUND): Response {
    return this.error(res, error, StatusCodes.NOT_FOUND);
  }

  static conflict(res: Response, error: string = ResponseMessages.USER_ALREADY_EXISTS): Response {
    return this.error(res, error, StatusCodes.CONFLICT);
  }

  static validationError(res: Response, error: string, details?: DetailsType): Response {
    return this.error(res, error, StatusCodes.BAD_REQUEST, details);
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
      success: true,
      message,
      statusCode: StatusCodes.OK,
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
