# LMS Backend - NestJS MongoDB API

A comprehensive backend solution for a Learning Management System built with NestJS and MongoDB, featuring Category, SubCategory, and Course management with full CRUD operations, relationships validation, pagination, sorting, filtering, and soft delete functionality.

## Features

- ✅ Full CRUD operations for Category, SubCategory, and Course
- ✅ Relationship validation (SubCategory → Category, Course → Categories & SubCategories)
- ✅ Pagination, Sorting, Filtering, and Search
- ✅ Soft delete using `isDeleted` flag
- ✅ DTO validation with class-validator
- ✅ Mongoose schemas with proper references
- ✅ MongoDB aggregation for category subcategory count
- ✅ Global exception handling
- ✅ Unified API responses
- ✅ MongoDB transactions support (ready for multi-document operations)

## Project Structure

```
src/
├── modules/
│   ├── category/
│   │   ├── schemas/
│   │   │   └── category.schema.ts
│   │   ├── dto/
│   │   │   └── category.dto.ts
│   │   ├── category.service.ts
│   │   ├── category.controller.ts
│   │   └── category.module.ts
│   ├── subcategory/
│   │   ├── schemas/
│   │   │   └── subcategory.schema.ts
│   │   ├── dto/
│   │   │   └── subcategory.dto.ts
│   │   ├── subcategory.service.ts
│   │   ├── subcategory.controller.ts
│   │   └── subcategory.module.ts
│   └── course/
│       ├── schemas/
│       │   └── course.schema.ts
│       ├── dto/
│       │   └── course.dto.ts
│       ├── course.service.ts
│       ├── course.controller.ts
│       └── course.module.ts
├── common/
│   ├── dto/
│   │   └── pagination.dto.ts
│   └── exceptions/
│       └── api-exception.filter.ts
├── app.module.ts
└── main.ts
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository>
   cd lms-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment variables**
   Create a `.env` file based on `.env.example`:
   ```
   MONGODB_URI=mongodb://localhost:27017/lms-db
   PORT=3000
   ```

4. **Start MongoDB** (if running locally)
   ```bash
   mongod
   ```

5. **Run the application**
   ```bash
   npm run start:dev
   ```

The application will start on `http://localhost:3000`

## API Endpoints

### Category Management

#### Create Category
```http
POST /api/categories
Content-Type: application/json

{
  "name": "Web Development",
  "description": "Learn web development basics"
}
```

#### Get All Categories
```http
GET /api/categories?skip=0&limit=10&search=web&sortBy=createdAt&sortOrder=desc
```

**Query Parameters:**
- `skip` (optional): Number of items to skip (default: 0)
- `limit` (optional): Number of items per page (default: 10)
- `search` (optional): Search by name or description
- `sortBy` (optional): Field to sort by (default: createdAt)
- `sortOrder` (optional): Sort order - `asc` or `desc` (default: desc)

#### Get Category by ID
```http
GET /api/categories/:id
```

#### Get Categories with SubCategory Count
```http
GET /api/categories/with-subcategory-count
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
      "description": "Learn web development basics",
      "subcategoryCount": 5,
      "createdAt": "2024-01-17T10:00:00Z",
      "updatedAt": "2024-01-17T10:00:00Z"
    }
  ]
}
```

#### Update Category
```http
PUT /api/categories/:id
Content-Type: application/json

{
  "name": "Advanced Web Development",
  "description": "Learn advanced web development"
}
```

#### Delete Category (Soft Delete)
```http
DELETE /api/categories/:id
```

### SubCategory Management

#### Create SubCategory
```http
POST /api/subcategories
Content-Type: application/json

{
  "name": "JavaScript",
  "description": "JavaScript fundamentals",
  "category": "507f1f77bcf86cd799439011"
}
```

#### Get All SubCategories
```http
GET /api/subcategories?skip=0&limit=10&search=javascript&sortBy=createdAt&sortOrder=desc
```

#### Get SubCategory by ID
```http
GET /api/subcategories/:id
```

#### Update SubCategory
```http
PUT /api/subcategories/:id
Content-Type: application/json

{
  "name": "Advanced JavaScript",
  "description": "Advanced JavaScript concepts"
}
```

#### Delete SubCategory (Soft Delete)
```http
DELETE /api/subcategories/:id
```

### Course Management

#### Create Course
```http
POST /api/courses
Content-Type: application/json

{
  "name": "Full Stack Web Development",
  "description": "Complete course on full stack development",
  "duration": 120,
  "level": "intermediate",
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}
```

**Note:** All selected SubCategories must belong to the selected Categories.

#### Get All Courses
```http
GET /api/courses?skip=0&limit=10&search=web&sortBy=createdAt&sortOrder=desc
```

#### Get Course by ID
```http
GET /api/courses/:id
```

#### Get Courses by Category
```http
GET /api/courses/by-category/:categoryId
```

#### Get Courses by SubCategory
```http
GET /api/courses/by-subcategory/:subCategoryId
```

#### Update Course
```http
PUT /api/courses/:id
Content-Type: application/json

{
  "name": "Advanced Full Stack Development",
  "duration": 150,
  "level": "advanced",
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439012"]
}
```

#### Delete Course (Soft Delete)
```http
DELETE /api/courses/:id
```

## Response Format

All API responses follow a unified format:

### Success Response
```json
{
  "statusCode": 200,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Additional error details"],
  "timestamp": "2024-01-17T10:00:00.000Z"
}
```

## Validation Rules

### Category
- `name` (required): String, 2-100 characters, must be unique
- `description` (optional): String, max 500 characters

### SubCategory
- `name` (required): String, 2-100 characters
- `description` (optional): String, max 500 characters
- `category` (required): Valid MongoDB ObjectId of an existing Category

### Course
- `name` (required): String, 2-100 characters, must be unique
- `description` (optional): String, max 500 characters
- `duration` (required): Positive number (hours)
- `level` (required): One of `beginner`, `intermediate`, `advanced`
- `categories` (required): Array of valid MongoDB ObjectIds, minimum 1
- `subCategories` (required): Array of valid MongoDB ObjectIds, minimum 1
  - **Important:** All SubCategories must belong to the selected Categories

## MongoDB Aggregation Examples

### Get Category with SubCategory Count
```javascript
db.categories.aggregate([
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
```

### Get Courses with Category Details
```javascript
db.courses.aggregate([
  { $match: { isDeleted: false } },
  {
    $lookup: {
      from: 'categories',
      localField: 'categories',
      foreignField: '_id',
      as: 'categoryDetails',
    },
  },
  {
    $lookup: {
      from: 'subcategories',
      localField: 'subCategories',
      foreignField: '_id',
      as: 'subCategoryDetails',
    },
  },
  {
    $project: {
      name: 1,
      description: 1,
      duration: 1,
      level: 1,
      categoryCount: { $size: '$categoryDetails' },
      subCategoryCount: { $size: '$subCategoryDetails' },
      categoryDetails: 1,
      subCategoryDetails: 1,
    },
  },
]);
```

## Error Handling

The application includes global exception handling with proper HTTP status codes:

- **400 Bad Request**: Validation errors, business logic violations
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server errors
- **201 Created**: Successful creation
- **200 OK**: Successful retrieval/update/deletion

## Testing

### Run Unit Tests
```bash
npm run test
```

### Run E2E Tests
```bash
npm run test:e2e
```

### Watch Mode
```bash
npm run test:watch
```

## Development

### Run in Watch Mode
```bash
npm run start:dev
```

### Format Code
```bash
npm run format
```

### Lint Code
```bash
npm run lint
```

### Build for Production
```bash
npm run build
```

### Run Production Build
```bash
npm run start:prod
```

## Key Features Implementation

### 1. Soft Delete
All entities include `isDeleted` and `deletedAt` fields. Deleted records are excluded from queries using `{ isDeleted: false }` filter.

### 2. Relationship Validation
- SubCategory must belong to a valid Category
- All Course SubCategories must belong to the selected Categories
- Automatic validation on creation and update

### 3. Pagination & Search
- Skip/limit based pagination
- Full-text search on name and description
- Flexible sorting (ASC/DESC)
- Dynamic sort field selection

### 4. Data Population
Mongoose `populate()` is used to automatically fetch related data:
- SubCategory includes Category details
- Course includes Category and SubCategory details

### 5. Aggregation Pipeline
MongoDB aggregation is used for complex queries:
- Category with SubCategory count
- Multi-stage pipeline for complex data transformations

## Future Enhancements

- [ ] Authentication & Authorization (JWT)
- [ ] Role-based access control
- [ ] File uploads for course materials
- [ ] MongoDB transactions for multi-document operations
- [ ] Caching with Redis
- [ ] API rate limiting
- [ ] Comprehensive logging
- [ ] Unit and E2E tests
- [ ] Docker containerization
- [ ] CI/CD pipeline

## License

UNLICENSED

## Support

For issues or questions, please create an issue in the repository.
