import 'reflect-metadata';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

// Metadata keys for parameter decorators
export const PARAM_TYPES_METADATA = 'design:paramtypes';
export const PARAMS_METADATA = 'route:params';

// Parameter types
export enum ParamType {
  BODY = 'body',
  FORM = 'form',
  PARAMS = 'params',
  QUERY = 'query',
  FILE = 'file',
  FILES = 'files',
}

// Parameter info interface
export interface ParamInfo {
  index: number;
  type: ParamType;
  dto: any;
  paramName?: string;
}

// Utility function to create parameter decorators
function createParamDecorator(type: ParamType) {
  return (paramNameOrDtoOrOptions?: string | any, dtoType?: any) => {
    return (target: Object, propertyKey: string | symbol, parameterIndex: number) => {
      // Get existing params metadata or initialize an empty array
      const existingParams: ParamInfo[] =
        Reflect.getMetadata(PARAMS_METADATA, target.constructor, propertyKey) || [];

      // Handle different parameter signatures
      let paramName: string | undefined;
      let dto: any;

      if (typeof paramNameOrDtoOrOptions === 'string') {
        // Case: @Params('id'), or @Query('filter')
        paramName = paramNameOrDtoOrOptions;
        dto = dtoType;
      } else {
        // Case: @Body(UserDto), or @Query()
        dto = paramNameOrDtoOrOptions;
      }

      // Add parameter info
      existingParams.push({
        index: parameterIndex,
        type,
        dto,
        paramName,
      });

      // Update metadata
      Reflect.defineMetadata(PARAMS_METADATA, existingParams, target.constructor, propertyKey);
    };
  };
}

/**
 * Detects if a request is multipart/form-data
 */
function isMultipartFormData(ctx: any): boolean {
  const contentType = ctx.request.headers.get('content-type') || '';
  return contentType.includes('multipart/form-data');
}

/**
 * Extract and validate parameters based on metadata
 * @param ctx Elysia context
 * @param target Controller class
 * @param propertyKey Route handler method name
 * @returns Array of processed parameters or error object
 */
export async function processParameters(
  ctx: any,
  target: any,
  propertyKey: string | symbol
): Promise<any[] | { error: string; details: ValidationError[] }> {
  const paramsMetadata: ParamInfo[] =
    Reflect.getMetadata(PARAMS_METADATA, target.constructor, propertyKey) || [];

  // If no param decorators, return an empty array
  if (!paramsMetadata || paramsMetadata.length === 0) {
    return [];
  }

  // Extract parameter types from metadata (for type validation)
  const paramTypes = Reflect.getMetadata(PARAM_TYPES_METADATA, target, propertyKey) || [];

  // Prepare parameters array to be returned
  const params: any[] = [];

  // Check if this is a multipart form request
  const isFormData = isMultipartFormData(ctx);

  // Process each parameter
  for (const paramInfo of paramsMetadata) {
    const { index, type, dto, paramName } = paramInfo;

    // Extract raw data from context based on parameter type
    let rawValue: any;

    switch (type) {
      case ParamType.BODY:
        // If it's a multipart form, body might be empty or parsed differently
        if (isFormData) {
          // In multipart forms, JSON data might be in a field named 'json' or similar
          rawValue = ctx.body?.json || {};
        } else {
          rawValue = ctx.body;
        }
        break;
      case ParamType.FORM:
        // For form data, get all form fields except files
        if (isFormData) {
          // Extract form fields from multipart form
          const formData = ctx.body;

          // Remove file fields
          const fileFields = Object.keys(formData || {}).filter(
            (key) =>
              formData[key] instanceof File ||
              (Array.isArray(formData[key]) && formData[key][0] instanceof File)
          );

          // Create a new object without file fields
          rawValue = { ...formData };
          fileFields.forEach((field) => delete rawValue[field]);
        } else {
          // If not multipart/form-data, use body as is (for application/x-www-form-urlencoded)
          rawValue = ctx.body;
        }
        break;
      case ParamType.FILE:
        if (isFormData && ctx.body) {
          // Get single file
          if (paramName) {
            const file = ctx.body[paramName];
            rawValue = file instanceof File ? file : null;
          } else {
            // Find first file in the request
            for (const key in ctx.body) {
              if (ctx.body[key] instanceof File) {
                rawValue = ctx.body[key];
                break;
              }
            }
          }
        } else {
          rawValue = null;
        }
        break;
      case ParamType.FILES:
        if (isFormData && ctx.body) {
          if (paramName) {
            // Get specific files array or single file converted to array
            const filesOrFile = ctx.body[paramName];
            if (Array.isArray(filesOrFile)) {
              rawValue = filesOrFile.filter((f) => f instanceof File);
            } else if (filesOrFile instanceof File) {
              rawValue = [filesOrFile];
            } else {
              rawValue = [];
            }
          } else {
            // Get all files from request
            rawValue = Object.keys(ctx.body).flatMap((key) => {
              const value = ctx.body[key];
              if (value instanceof File) {
                return [value];
              } else if (Array.isArray(value) && value[0] instanceof File) {
                return value;
              }
              return [];
            });
          }
        } else {
          rawValue = [];
        }
        break;
      case ParamType.PARAMS:
        rawValue = paramName ? ctx.params[paramName] : ctx.params;
        break;
      case ParamType.QUERY:
        rawValue = paramName ? ctx.query[paramName] : ctx.query;
        break;
    }

    // Skip validation for File/Files parameters
    if (type === ParamType.FILE || type === ParamType.FILES) {
      params[index] = rawValue;
      continue;
    }

    // If DTO type is provided, validate and transform
    if (dto) {
      try {
        // Transform plain object to class instance
        const transformed = plainToInstance(dto, rawValue);

        // Validate the instance
        const errors = await validate(transformed, {
          whitelist: true,
          forbidNonWhitelisted: true,
          validationError: { target: false },
        });

        if (errors.length > 0) {
          // Return validation errors
          return {
            error: `Validation failed for ${type}${paramName ? `.${paramName}` : ''}`,
            details: errors,
          };
        }

        // Set the validated value
        params[index] = transformed;
      } catch (error) {
        console.error(`Error processing parameter at index ${index}:`, error);

        // Return error object
        return {
          error: `Error processing ${type}${paramName ? `.${paramName}` : ''}`,
          details: [
            { property: type, constraints: { processing: 'Processing error' } } as ValidationError,
          ],
        };
      }
    } else {
      // No DTO, just use raw value
      params[index] = rawValue;
    }
  }

  return params;
}

// Create parameter decorators
export const Body = createParamDecorator(ParamType.BODY);
export const Form = createParamDecorator(ParamType.FORM);
export const Params = createParamDecorator(ParamType.PARAMS);
export const Query = createParamDecorator(ParamType.QUERY);
export const File = createParamDecorator(ParamType.FILE);
export const Files = createParamDecorator(ParamType.FILES);
