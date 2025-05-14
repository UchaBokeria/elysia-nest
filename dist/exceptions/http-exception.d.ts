/**
 * Base class for HTTP exceptions
 */
export declare class HttpException extends Error {
    private readonly response;
    readonly statusCode: number;
    constructor(response: string | Record<string, any>, statusCode: number);
    /**
     * Get the exception response
     */
    getResponse(): string | Record<string, any>;
}
/**
 * 400 Bad Request Exception
 */
export declare class BadRequestException extends HttpException {
    constructor(message?: string | Record<string, any>);
}
/**
 * 401 Unauthorized Exception
 */
export declare class UnauthorizedException extends HttpException {
    constructor(message?: string | Record<string, any>);
}
/**
 * 403 Forbidden Exception
 */
export declare class ForbiddenException extends HttpException {
    constructor(message?: string | Record<string, any>);
}
/**
 * 404 Not Found Exception
 */
export declare class NotFoundException extends HttpException {
    constructor(message?: string | Record<string, any>);
}
/**
 * 500 Internal Server Exception
 */
export declare class InternalServerErrorException extends HttpException {
    constructor(message?: string | Record<string, any>);
}
