# LMS Backend - Implementation Setup Guide

This guide provides comprehensive documentation of the implemented NestJS backend for the Learning Management System.

## Architecture Overview

The application follows NestJS best practices with a modular architecture:

```
Application Layer
├── Modules (Category, SubCategory, Course)
├── Services (Business Logic)
├── Controllers (HTTP Endpoints)
└── DTOs (Data Validation)

Data Layer
├── Schemas (MongoDB Collections)
├── Repositories (Data Access)
└── Aggregations (Complex Queries)

Common Layer
├── Exceptions (Global Error Handling)
├── DTOs (Pagination, Common Utilities)
└── Helpers (Aggregation Pipelines)
```

## Implemented Features

### 1. ✅ Complete CRUD Operations

#### Category CRUD
- **Create**: POST `/api/categories` - Create new category
- **Read**: GET `/api/categories` - List all categories with pagination
- **Read**: GET `/api/categories/:id` - Get category by ID
- **Update**: PUT `/api/categories/:id` - Update category
- **Delete**: DELETE `/api/categories/:id` - Soft delete category

#### SubCategory CRUD
- **Create**: POST `/api/subcategories` - Create new subcategory
- **Read**: GET `/api/subcategories` - List all subcategories
- **Read**: GET `/api/subcategories/:id` - Get subcategory by ID
- **Update**: PUT `/api/subcategories/:id` - Update subcategory
- **Delete**: DELETE `/api/subcategories/:id` - Soft delete subcategory

#### Course CRUD
- **Create**: POST `/api/courses` - Create new course
- **Read**: GET `/api/courses` - List all courses
- **Read**: GET `/api/courses/:id` - Get course by ID
- **Update**: PUT `/api/courses/:id` - Update course
- **Delete**: DELETE `/api/courses/:id` - Soft delete course

### 2. ✅ Relationship Validation

#### SubCategory → Category Validation
```typescript
// When creating SubCategory, the referenced Category must exist
async create(createSubCategoryDto: CreateSubCategoryDto): Promise<SubCategory> {
  // Validate category exists
  await this.categoryService.findById(createSubCategoryDto.category);
  
  const subcategory = new this.subCategoryModel(createSubCategoryDto);
  return subcategory.save();
}
```

#### Course → Categories & SubCategories Validation
```typescript
// Validates:
// 1. All categories exist
// 2. All subcategories exist
// 3. All selected subcategories belong to the selected categories

async validateSubCategoriesInCategories(
  categoryIds: string[],
  subCategoryIds: string[],
): Promise<void> {
  const subcategories = await this.subCategoryService.findByIds(subCategoryIds);
  
  const invalidSubcategories = subcategories.filter(
    (sub) => !categoryIds.includes(sub.category.toString()),
  );

  if (invalidSubcategories.length > 0) {
    throw new BadRequestException(
      'All selected SubCategories must belong to the selected Categories',
    );
  }
}
```

### 3. ✅ Listing Features (Pagination, Sorting, Filtering, Search)

All list endpoints support:

```typescript
// Query Parameters
{
  skip: 0,              // Number of items to skip (default: 0)
  limit: 10,            // Items per page (default: 10)
  search: "string",     // Full-text search
  sortBy: "createdAt",  // Field to sort by (default: createdAt)
  sortOrder: "desc"     // "asc" or "desc" (default: desc)
}

// Example: GET /api/categories?skip=0&limit=10&search=web&sortBy=name&sortOrder=asc
```

Implementation in service:
```typescript
async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<Category>> {
  const { skip = 0, limit = 10, search, sortBy = 'createdAt', sortOrder = 'desc' } = paginationDto;

  const filter: any = { isDeleted: false };

  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  const sortQuery: any = {};
  sortQuery[sortBy] = sortOrder === 'asc' ? 1 : -1;

  const [data, total] = await Promise.all([
    this.categoryModel.find(filter).sort(sortQuery).skip(skip).limit(limit),
    this.categoryModel.countDocuments(filter),
  ]);

  return {
    data,
    total,
    skip,
    limit,
    hasMore: skip + limit < total,
  };
}
```

### 4. ✅ Soft Delete Implementation

All entities have soft delete fields:
```typescript
@Prop({ default: false })
isDeleted: boolean;

@Prop({ default: null })
deletedAt: Date;
```

Deletion operation:
```typescript
async remove(id: string): Promise<Category> {
  const category = await this.findById(id);
  category.isDeleted = true;
  category.deletedAt = new Date();
  return category.save();
}
```

All queries automatically filter deleted records:
```typescript
const filter: any = { isDeleted: false };
```

### 5. ✅ MongoDB Aggregation - Category with SubCategory Count

Endpoint: `GET /api/categories/with-subcategory-count`

Implementation:
```typescript
async getWithSubcategoryCount() {
  return this.categoryModel.aggregate([
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'subcategories',
        localField: '_id',
        foreignField: 'category',
        as: 'subcategories',
      },
    },
    {
      $addFields: {
        subcategoryCount: {
          $size: {
            $filter: {
              input: '$subcategories',
              as: 'sub',
              cond: { $eq: ['$$sub.isDeleted', false] },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        subcategoryCount: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    { $sort: { createdAt: -1 } },
  ]);
}
```

Response:
```json
{
  "statusCode": 200,
  "message": "Categories with subcategory count retrieved successfully",
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "name": "Web Development",
      "description": "Learn web development",
      "subcategoryCount": 5,
      "createdAt": "2024-01-17T10:00:00Z",
      "updatedAt": "2024-01-17T10:00:00Z"
    }
  ]
}
```

## Code Quality Implementation

### 1. NestJS Module Structure

Each module follows a consistent structure:

```
module/
├── schemas/
│   └── entity.schema.ts        // Mongoose schema definition
├── dto/
│   └── entity.dto.ts           // Data Transfer Objects
├── entity.service.ts           // Business logic
├── entity.controller.ts        // HTTP handlers
└── entity.module.ts            // Module definition
```

Module Example:
```typescript
@Module({
  imports: [
    MongooseModule.forFeature([{ name: Category.name, schema: CategorySchema }])
  ],
  providers: [CategoryService],
  controllers: [CategoryController],
  exports: [CategoryService], // Export for other modules
})
export class CategoryModule {}
```

### 2. DTO Validation with class-validator

```typescript
export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;
}
```

Global validation pipe in main.ts:
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### 3. Mongoose Schemas with References

```typescript
@Schema({ timestamps: true })
export class SubCategory extends Document {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category: Category; // Reference to Category
}

@Schema({ timestamps: true })
export class Course extends Document {
  @Prop([{ type: Types.ObjectId, ref: 'Category' }])
  categories: Category[]; // Multiple references

  @Prop([{ type: Types.ObjectId, ref: 'SubCategory' }])
  subCategories: SubCategory[]; // Multiple references
}
```

### 4. Unified Error Responses

Global exception filter:
```typescript
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    // Handle specific exceptions
    if (exception instanceof BadRequestException) {
      status = HttpStatus.BAD_REQUEST;
      // ... extract message
    } else if (exception instanceof NotFoundException) {
      status = HttpStatus.NOT_FOUND;
      // ... extract message
    }

    response.status(status).json({
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
    });
  }
}
```

All controllers use this filter:
```typescript
@Controller('api/categories')
@UseFilters(AllExceptionsFilter)
export class CategoryController {
  // ...
}
```

### 5. HTTP Status Codes

- **201 Created**: Resource successfully created
- **200 OK**: Successful GET/PUT/DELETE
- **400 Bad Request**: Validation errors, business logic violations
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors

### 6. MongoDB Transactions Ready

The service layer is designed to support MongoDB transactions for multi-document operations:

```typescript
// Future implementation example:
async createCourseWithTransactions(createCourseDto: CreateCourseDto, session: ClientSession) {
  // Multiple operations in single transaction
  const course = await this.courseModel.create([createCourseDto], { session });
  // Other operations...
  // Transaction will rollback on any error
}
```

## Dependencies

### Core Dependencies
- `@nestjs/common`: NestJS framework
- `@nestjs/core`: NestJS core
- `@nestjs/mongoose`: Mongoose integration
- `@nestjs/config`: Environment configuration
- `@nestjs/platform-express`: Express support

### Database & Validation
- `mongoose`: MongoDB ODM
- `class-validator`: DTO validation
- `class-transformer`: Data transformation

### Development
- `typescript`: TypeScript support
- `jest`: Testing framework
- `@nestjs/testing`: NestJS testing utilities
- `supertest`: HTTP assertion library

## API Response Examples

### Success Response
```json
{
  "statusCode": 201,
  "message": "Category created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Web Development",
    "description": "Learn web development basics",
    "isDeleted": false,
    "createdAt": "2024-01-17T10:00:00Z",
    "updatedAt": "2024-01-17T10:00:00Z"
  }
}
```

### Paginated Response
```json
{
  "statusCode": 200,
  "message": "Categories retrieved successfully",
  "data": {
    "data": [
      { /* category objects */ }
    ],
    "total": 25,
    "skip": 0,
    "limit": 10,
    "hasMore": true
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Category name already exists",
  "timestamp": "2024-01-17T10:00:00.000Z"
}
```

## Testing

Comprehensive E2E tests are included in `test/app.e2e-spec.ts`:

```bash
# Run E2E tests
npm run test:e2e

# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

## File Structure Summary

```
src/
├── modules/
│   ├── category/               # Category module
│   ├── subcategory/            # SubCategory module
│   └── course/                 # Course module
├── common/
│   ├── dto/                    # Common DTOs (Pagination)
│   ├── exceptions/             # Global exception filter
│   └── helpers/                # Aggregation helpers
├── app.module.ts               # Root module with MongoDB config
└── main.ts                     # Application entry point

test/
└── app.e2e-spec.ts             # End-to-end tests
```

## Key Implementation Decisions

1. **Soft Delete**: Records are marked as deleted but not removed, maintaining referential integrity
2. **Relationship Validation**: Validation happens at service layer with meaningful error messages
3. **Pagination**: Skip/limit based pagination for better performance
4. **Aggregation**: MongoDB aggregation pipeline for complex queries
5. **Error Handling**: Centralized exception handling with consistent response format
6. **Module Exports**: Services are exported for cross-module dependency injection
7. **Timestamps**: Automatic `createdAt` and `updatedAt` from Mongoose schema option

## Next Steps for Enhancement

1. Add JWT authentication and authorization
2. Implement role-based access control (RBAC)
3. Add file upload for course materials
4. Implement MongoDB transactions for critical operations
5. Add Redis caching for frequently accessed data
6. Set up API rate limiting
7. Add comprehensive logging system
8. Deploy with Docker containers
9. Set up CI/CD pipeline

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check MONGODB_URI in .env file
- Verify MongoDB port (default: 27017)

### Validation Errors
- Check DTOs for required fields
- Ensure MongoDB ObjectIds are valid
- Verify dates are in ISO format

### Reference Errors
- Ensure related entities exist before creation
- Check ObjectId references are valid
- Verify soft delete filters in queries

## Support Resources

- NestJS Documentation: https://docs.nestjs.com
- Mongoose Documentation: https://mongoosejs.com
- class-validator: https://github.com/typestack/class-validator
- MongoDB Aggregation: https://docs.mongodb.com/manual/aggregation/
