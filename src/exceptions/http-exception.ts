/**
 * Base class for HTTP exceptions
 */
export class HttpException extends Error {
  constructor(
    private readonly response: string | Record<string, any>,
    public readonly statusCode: number
  ) {
    super(typeof response === 'string' ? response : JSON.stringify(response));
    this.name = this.constructor.name;
  }

  /**
   * Get the exception response
   */
  getResponse(): string | Record<string, any> {
    return this.response;
  }
}

/**
 * 400 Bad Request Exception
 */
export class BadRequestException extends HttpException {
  constructor(message: string | Record<string, any> = 'Bad Request') {
    super(message, 400);
  }
}

/**
 * 401 Unauthorized Exception
 */
export class UnauthorizedException extends HttpException {
  constructor(message: string | Record<string, any> = 'Unauthorized') {
    super(message, 401);
  }
}

/**
 * 403 Forbidden Exception
 */
export class ForbiddenException extends HttpException {
  constructor(message: string | Record<string, any> = 'Forbidden') {
    super(message, 403);
  }
}

/**
 * 404 Not Found Exception
 */
export class NotFoundException extends HttpException {
  constructor(message: string | Record<string, any> = 'Not Found') {
    super(message, 404);
  }
}

/**
 * 500 Internal Server Exception
 */
export class InternalServerErrorException extends HttpException {
  constructor(message: string | Record<string, any> = 'Internal Server Error') {
    super(message, 500);
  }
} 