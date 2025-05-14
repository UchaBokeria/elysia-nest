# Swagger Integration with Parameter Decorators

This module provides automatic OpenAPI documentation generation for your API endpoints based on parameter decorators and DTO validation rules.

## Overview

The integration automatically:

1. Generates OpenAPI schemas from class-validator decorators in your DTOs
2. Extracts route information from controller methods
3. Maps parameter decorators to OpenAPI parameter types
4. Creates documentation for file uploads, form data, and JSON payloads
5. Organizes endpoints by controller (as tags)

## Usage

### Accessing the Documentation

The Swagger UI is automatically available at `/swagger` in your application.

### DTOs and Validation

The Swagger documentation automatically reflects your class-validator decorators:

```typescript
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty({ message: 'Username is required' })
  @IsString()
  username: string;  // Appears as required string

  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail({}, { message: 'Email must be valid' })
  email: string;     // Appears as required string with email format

  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;  // Appears as string with minLength: 8
}
```

### Parameter Decorators

The following parameter decorators are automatically documented:

- `@Body()` - Documented as request body in JSON format
- `@Form()` - Documented as request body in form/multipart format
- `@Params()` - Documented as path parameters
- `@Query()` - Documented as query parameters
- `@File()` - Documented as file upload field
- `@Files()` - Documented as multiple file upload fields

### Example

For this controller method:

```typescript
@Post('/upload/:category')
async uploadFile(
  @File() file: any,
  @Form() metadata: FileMetadataDto,
  @Params('category') category: string,
  @Query('overwrite') overwrite: boolean,
  { set }: any
) {
  // Implementation...
}
```

The Swagger will automatically generate:

1. A path parameter for `category`
2. A query parameter for `overwrite`
3. A multipart/form-data request body that includes:
   - File upload field for `file`
   - Form fields from `FileMetadataDto`

## How It Works

The system uses reflection (via `reflect-metadata`) to:

1. Extract class-validator decorators from DTOs and convert them to OpenAPI schemas
2. Get route information from controller methods
3. Map parameter decorators to OpenAPI parameters and request bodies

## Extending the Documentation

### Custom Route Documentation

You can enhance the documentation by using JSDoc comments on your controller methods.

### Custom Schema Validation

Any class-validator decorators are automatically translated to equivalent OpenAPI schema validation rules. 