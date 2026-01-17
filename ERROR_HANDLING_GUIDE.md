# Error Handling & Validation Guide

This guide documents all validation rules, error scenarios, and how they are handled in the LMS backend.

## Validation Rules by Module

### Category Module

#### Create Category Validation
```typescript
// Rules:
// - name: Required, String, 2-100 characters, Unique
// - description: Optional, String, max 500 characters

// Example Valid Request:
{
  "name": "Web Development",
  "description": "Learn web development fundamentals"
}

// Example Invalid Requests:

// 1. Missing required field
{
  "description": "No name provided"
}
// Error: 400 Bad Request - "name should not be empty"

// 2. Name too short
{
  "name": "W"
}
// Error: 400 Bad Request - "name must be longer than or equal to 2 characters"

// 3. Name too long
{
  "name": "This is a very long category name that exceeds the maximum allowed length of 100 characters"
}
// Error: 400 Bad Request - "name must be shorter than or equal to 100 characters"

// 4. Duplicate name
{
  "name": "Web Development"  // Already exists
}
// Error: 400 Bad Request - "Category name already exists"

// 5. Invalid data type
{
  "name": 12345  // Number instead of string
}
// Error: 400 Bad Request - "name must be a string"

// 6. Unknown properties
{
  "name": "Category",
  "unknownField": "value"
}
// Error: 400 Bad Request - "property unknownField should not exist"
```

#### Update Category Validation
```typescript
// Rules:
// - name: Optional, String, 2-100 characters, Unique (if updated)
// - description: Optional, String, max 500 characters

// Example Valid Request:
{
  "name": "Advanced Web Development"
}

// Example Invalid Requests:

// 1. Duplicate name on update
{
  "name": "Another Existing Category"
}
// Error: 400 Bad Request - "Category name already exists"

// 2. Invalid category ID format
PUT /api/categories/invalid-id
// Error: 400 Bad Request - "id must be a mongodb id"

// 3. Non-existent category
PUT /api/categories/507f1f77bcf86cd799439999
// Error: 404 Not Found - "Category with ID 507f1f77bcf86cd799439999 not found"
```

### SubCategory Module

#### Create SubCategory Validation
```typescript
// Rules:
// - name: Required, String, 2-100 characters
// - description: Optional, String, max 500 characters
// - category: Required, Valid MongoDB ObjectId, Must reference existing Category

// Example Valid Request:
{
  "name": "JavaScript",
  "description": "JavaScript programming language",
  "category": "507f1f77bcf86cd799439011"
}

// Example Invalid Requests:

// 1. Invalid category reference format
{
  "name": "JavaScript",
  "category": "invalid-id"
}
// Error: 400 Bad Request - "category must be a mongodb id"

// 2. Non-existent category
{
  "name": "JavaScript",
  "category": "507f1f77bcf86cd799439999"
}
// Error: 404 Not Found - "Category with ID 507f1f77bcf86cd799439999 not found"

// 3. Missing category
{
  "name": "JavaScript"
}
// Error: 400 Bad Request - "category should not be empty"

// 4. Invalid name
{
  "name": "JS",  // Too short
  "category": "507f1f77bcf86cd799439011"
}
// Error: 400 Bad Request - "name must be longer than or equal to 2 characters"
```

#### Update SubCategory Validation
```typescript
// Rules:
// - name: Optional, String, 2-100 characters
// - description: Optional, String, max 500 characters
// - category: Optional, Valid MongoDB ObjectId, Must reference existing Category

// Example Valid Request:
{
  "name": "Advanced JavaScript",
  "category": "507f1f77bcf86cd799439011"
}

// Example Invalid Requests:

// 1. Update to non-existent category
{
  "category": "507f1f77bcf86cd799439999"
}
// Error: 404 Not Found - "Category with ID 507f1f77bcf86cd799439999 not found"

// 2. Non-existent subcategory
PUT /api/subcategories/507f1f77bcf86cd799439999
// Error: 404 Not Found - "SubCategory with ID 507f1f77bcf86cd799439999 not found"
```

### Course Module

#### Create Course Validation - CRITICAL
```typescript
// Rules:
// - name: Required, String, 2-100 characters, Unique
// - description: Optional, String, max 500 characters
// - duration: Required, Positive Number
// - level: Required, Enum (beginner, intermediate, advanced)
// - categories: Required, Array of valid MongoDB ObjectIds, min 1
// - subCategories: Required, Array of valid MongoDB ObjectIds, min 1
// - CRITICAL: All SubCategories MUST belong to selected Categories

// Example Valid Request:
{
  "name": "Full Stack Web Development",
  "description": "Learn full stack development",
  "duration": 120,
  "level": "intermediate",
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439012", "507f1f77bcf86cd799439013"]
}

// Example Invalid Requests:

// 1. Missing required fields
{
  "name": "Course"
}
// Error: 400 Bad Request - "duration should not be empty", "level should not be empty", etc.

// 2. Invalid duration (negative or zero)
{
  "name": "Course",
  "duration": -10,
  "level": "beginner",
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439012"]
}
// Error: 400 Bad Request - "duration must be a positive number"

// 3. Invalid level
{
  "name": "Course",
  "duration": 100,
  "level": "expert",  // Invalid, must be: beginner, intermediate, advanced
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439012"]
}
// Error: 400 Bad Request - "level must be one of the following values: beginner, intermediate, advanced"

// 4. Empty categories or subCategories
{
  "name": "Course",
  "duration": 100,
  "level": "beginner",
  "categories": [],  // Must have at least 1
  "subCategories": ["507f1f77bcf86cd799439012"]
}
// Error: 400 Bad Request - "categories array must contain at least 1 elements"

// 5. Invalid MongoDB ObjectId format
{
  "name": "Course",
  "duration": 100,
  "level": "beginner",
  "categories": ["invalid-id"],
  "subCategories": ["507f1f77bcf86cd799439012"]
}
// Error: 400 Bad Request - "each value in categories must be a mongodb id"

// 6. Non-existent category
{
  "name": "Course",
  "duration": 100,
  "level": "beginner",
  "categories": ["507f1f77bcf86cd799439999"],  // Doesn't exist
  "subCategories": ["507f1f77bcf86cd799439012"]
}
// Error: 404 Not Found - "Category with ID 507f1f77bcf86cd799439999 not found"

// 7. Non-existent subcategory
{
  "name": "Course",
  "duration": 100,
  "level": "beginner",
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439999"]  // Doesn't exist
}
// Error: 400 Bad Request - "One or more SubCategories not found"

// 8. CRITICAL ERROR - SubCategory belongs to different Category
// Scenario:
// - Web Development Category: 507f1f77bcf86cd799439011
// - Mobile Development Category: 507f1f77bcf86cd799439020
// - JavaScript SubCategory: 507f1f77bcf86cd799439012 (belongs to Web Development)
// - React Native SubCategory: 507f1f77bcf86cd799439021 (belongs to Mobile Development)

{
  "name": "Invalid Course",
  "duration": 100,
  "level": "beginner",
  "categories": ["507f1f77bcf86cd799439011"],  // Web Development
  "subCategories": ["507f1f77bcf86cd799439021"]  // React Native (belongs to Mobile!)
}
// Error: 400 Bad Request - "All selected SubCategories must belong to the selected Categories"

// 9. Duplicate course name
{
  "name": "Full Stack Web Development",  // Already exists
  "duration": 100,
  "level": "beginner",
  "categories": ["507f1f77bcf86cd799439011"],
  "subCategories": ["507f1f77bcf86cd799439012"]
}
// Error: 400 Bad Request - "Course name already exists"
```

#### Update Course Validation
```typescript
// Rules:
// - All fields optional
// - If categories and subCategories are both updated:
//   - Validates relationship between them
// - If only categories updated:
//   - Validates existing subCategories still belong to new categories
// - If only subCategories updated:
//   - Validates new subCategories belong to existing categories

// Example Valid Request:
{
  "name": "Advanced Full Stack",
  "duration": 150
}

// Example Invalid Requests:

// 1. Update with invalid relationship
{
  "categories": ["507f1f77bcf86cd799439020"],  // Mobile Development
  "subCategories": ["507f1f77bcf86cd799439012"]  // JavaScript (belongs to Web)
}
// Error: 400 Bad Request - "All selected SubCategories must belong to the selected Categories"

// 2. Non-existent course
PUT /api/courses/507f1f77bcf86cd799439999
// Error: 404 Not Found - "Course with ID 507f1f77bcf86cd799439999 not found"

// 3. Invalid ObjectId format
PUT /api/courses/invalid-id
// Error: 400 Bad Request - "id must be a mongodb id"
```

## Error Response Examples

### Validation Error
```json
{
  "statusCode": 400,
  "message": "name must be a string",
  "errors": [
    "name must be a string"
  ],
  "timestamp": "2024-01-17T10:30:00.000Z"
}
```

### Relationship Error
```json
{
  "statusCode": 400,
  "message": "All selected SubCategories must belong to the selected Categories",
  "timestamp": "2024-01-17T10:30:00.000Z"
}
```

### Not Found Error
```json
{
  "statusCode": 404,
  "message": "Category with ID 507f1f77bcf86cd799439999 not found",
  "timestamp": "2024-01-17T10:30:00.000Z"
}
```

### Business Logic Error
```json
{
  "statusCode": 400,
  "message": "Category name already exists",
  "timestamp": "2024-01-17T10:30:00.000Z"
}
```

## Query Parameter Validation

### Pagination Parameters
```typescript
// Valid parameters:
GET /api/categories?skip=0&limit=10

// Invalid parameters:

// 1. Negative skip
GET /api/categories?skip=-5
// Error: 400 Bad Request - "skip must be a positive number"

// 2. Negative limit
GET /api/categories?limit=-10
// Error: 400 Bad Request - "limit must be a positive number"

// 3. Zero values (must be positive)
GET /api/categories?skip=0&limit=0
// Error: 400 Bad Request - "limit must be a positive number"

// 4. Non-numeric values
GET /api/categories?skip=abc&limit=xyz
// Automatically converted to numbers if possible, error if not convertible
```

### Sort Parameters
```typescript
// Valid parameters:
GET /api/categories?sortBy=name&sortOrder=asc
GET /api/categories?sortBy=createdAt&sortOrder=desc

// Invalid parameters:

// 1. Invalid sort order
GET /api/categories?sortOrder=invalid
// Error: 400 Bad Request - "sortOrder must be one of the following values: asc, desc"

// 2. Non-existent sort field will just ignore it and use default
GET /api/categories?sortBy=nonexistent
// Sorts by createdAt (default)
```

## Common HTTP Status Codes

### 201 Created
```json
{
  "statusCode": 201,
  "message": "Category created successfully",
  "data": { /* entity */ }
}
```

### 200 OK
```json
{
  "statusCode": 200,
  "message": "Category retrieved successfully",
  "data": { /* entity */ }
}
```

### 400 Bad Request
- Invalid input data
- Business logic validation failed
- Duplicate unique fields
- Invalid relationships

### 404 Not Found
- Resource doesn't exist
- Soft deleted resource

### 500 Internal Server Error
- Server errors
- Database connection errors
- Unexpected errors

## Best Practices for Testing

### 1. Test Validation Flow
```bash
# Test required field validation
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"description": "No name"}'
```

### 2. Test Relationship Validation
```bash
# Create course with mismatched categories/subcategories
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Invalid",
    "duration": 100,
    "level": "beginner",
    "categories": ["<categoryA>"],
    "subCategories": ["<subFromCategoryB>"]
  }'
```

### 3. Test Soft Delete
```bash
# Delete and verify it's not found
curl -X DELETE http://localhost:3000/api/categories/<id>
curl http://localhost:3000/api/categories/<id>  # Should return 404
```

### 4. Test Pagination
```bash
curl "http://localhost:3000/api/categories?skip=0&limit=5"
curl "http://localhost:3000/api/categories?skip=5&limit=5"  # Next page
```

### 5. Test Search
```bash
curl "http://localhost:3000/api/categories?search=web"
curl "http://localhost:3000/api/categories?search=development&sortOrder=asc"
```

## Debugging Tips

1. **Enable detailed validation messages**: NestJS provides detailed validation error messages
2. **Use MongoDB aggregation logs**: Monitor aggregation pipeline performance
3. **Check indexes**: Ensure database indexes are created for frequently queried fields
4. **Validate relationships**: Use MongoDB aggregation to check for orphaned references
5. **Monitor soft deletes**: Query with `isDeleted: false` filter explicitly

## Future Enhancements

- [ ] Add custom validation decorators
- [ ] Implement async validation
- [ ] Add field-level error messages in multiple languages
- [ ] Add request/response logging middleware
- [ ] Implement detailed audit trails
- [ ] Add webhook notifications for validation errors
