# Parameter Decorators

This module provides parameter decorators for controller handler methods in the Elysia framework. These decorators make it easy to access and validate request data.

## Available Decorators

- `@Body()` - Extracts and validates request body data
- `@Form()` - Extracts and validates form data from requests
- `@Params()` - Extracts and validates URL parameters
- `@Query()` - Extracts and validates query parameters
- `@File()` - Extracts a file from multipart/form-data requests
- `@Files()` - Extracts multiple files from multipart/form-data requests

## Basic Usage

```typescript
import { Controller, Get, Post, Body, Params, Query, Form } from '@/utils/core';
import { UserDto } from '@/dtos/user.dto';

@Controller('/users')
export class UsersController {
  @Post()
  async createUser(@Body() user: UserDto, { set }: any) {
    // user is automatically validated against UserDto
    return { success: true, user };
  }

  @Get('/:id')
  async getUser(@Params('id') id: string, { set }: any) {
    return { success: true, id };
  }

  @Get()
  async searchUsers(@Query('search') search: string, @Query() allQueries: any, { set }: any) {
    return { success: true, search, allQueries };
  }
}
```

## Form Data & File Uploads

The `@Form()`, `@File()`, and `@Files()` decorators are designed for handling form submissions and file uploads.

### Single File Upload

```typescript
@Post('/upload')
async uploadFile(
  @File() file: any,
  @Form() formData: FileMetadataDto,
  { set }: any
) {
  if (!file) {
    set.status = 400;
    return { success: false, message: 'No file uploaded' };
  }
  
  return {
    success: true,
    message: 'File uploaded successfully',
    fileName: file.name,
    fileSize: file.size,
    metadata: formData
  };
}
```

### Multiple Files Upload

```typescript
@Post('/upload/multiple')
async uploadMultipleFiles(
  @Files() files: any[],
  @Form() metadata: FileMetadataDto,
  { set }: any
) {
  if (!files || files.length === 0) {
    set.status = 400;
    return { success: false, message: 'No files uploaded' };
  }

  return {
    success: true,
    message: `${files.length} files uploaded successfully`,
    files: files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    })),
    metadata
  };
}
```

### Named File Fields

```typescript
@Post('/user/profile')
async updateProfile(
  @File('avatar') avatar: any,
  @File('document') document: any,
  @Form() userData: UserUpdateDto,
  { set }: any
) {
  // Handle files with specific field names
  return {
    success: true,
    message: 'Profile updated',
    avatarUploaded: !!avatar,
    documentUploaded: !!document,
    userData
  };
}
```

### Mixed JSON and Form Data

When sending both JSON data and form data (including files), use both `@Body()` and `@Form()` decorators:

```typescript
@Post('/complex-data')
async handleComplexData(
  @Body() jsonData: any,
  @Form() formData: any,
  @File('attachment') file: any,
  { set }: any
) {
  return {
    success: true,
    jsonData,
    formData,
    fileUploaded: !!file
  };
}
```

## Validation with DTOs

All decorators support DTO validation. When a DTO class is provided, the data is automatically validated using class-validator:

```typescript
@Post('/register')
async register(@Body() user: CreateUserDto, { set }: any) {
  // user has been validated against CreateUserDto using class-validator
  // If validation fails, an error response is automatically returned
  return { success: true, message: 'User registered', user };
}
```

## Error Handling

When validation fails, a 400 Bad Request response is returned with details about the validation errors:

```json
{
  "success": false,
  "message": "Validation failed for body",
  "errors": [
    {
      "property": "email",
      "constraints": {
        "isEmail": "Email must be valid"
      }
    }
  ]
}
``` 