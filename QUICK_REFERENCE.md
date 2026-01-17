# Quick Reference Guide

## 🚀 Quick Start (2 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Ensure MongoDB is running
mongod

# 4. Start development server
npm run start:dev

# API ready at http://localhost:3000
```

## 📚 Key Documentation

| File | Purpose |
|------|---------|
| [README.md](./README.md) | Quick start & overview |
| [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) | Complete API reference |
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Architecture & implementation details |
| [ERROR_HANDLING_GUIDE.md](./ERROR_HANDLING_GUIDE.md) | Validation rules & error examples |
| [MONGODB_QUERIES.md](./MONGODB_QUERIES.md) | MongoDB queries for testing |
| [COMPLETE_IMPLEMENTATION_CHECKLIST.md](./COMPLETE_IMPLEMENTATION_CHECKLIST.md) | All requirements verification |

## 🔧 API Endpoints Summary

### Categories
```
POST   /api/categories                          Create
GET    /api/categories                          List
GET    /api/categories/:id                      Get by ID
GET    /api/categories/with-subcategory-count   Aggregation
PUT    /api/categories/:id                      Update
DELETE /api/categories/:id                      Soft Delete
```

### SubCategories
```
POST   /api/subcategories           Create
GET    /api/subcategories           List
GET    /api/subcategories/:id       Get by ID
PUT    /api/subcategories/:id       Update
DELETE /api/subcategories/:id       Soft Delete
```

### Courses
```
POST   /api/courses                              Create
GET    /api/courses                              List
GET    /api/courses/:id                         Get by ID
GET    /api/courses/by-category/:categoryId      By Category
GET    /api/courses/by-subcategory/:subCatId     By SubCategory
PUT    /api/courses/:id                         Update
DELETE /api/courses/:id                         Soft Delete
```

## 📝 Example Requests

### Create Category
```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Web Development",
    "description": "Learn web development"
  }'
```

### List with Pagination & Search
```bash
curl "http://localhost:3000/api/categories?skip=0&limit=10&search=web&sortOrder=asc"
```

### Create Course (with validation)
```bash
curl -X POST http://localhost:3000/api/courses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Full Stack Web Development",
    "description": "Complete course",
    "duration": 120,
    "level": "intermediate",
    "categories": ["<categoryId>"],
    "subCategories": ["<subCategoryId>"]
  }'
```

### Get Categories with Count
```bash
curl http://localhost:3000/api/categories/with-subcategory-count
```

## 🔑 Key Features

### Pagination
- `skip` (default: 0) - Items to skip
- `limit` (default: 10) - Items per page
- Response includes `hasMore` flag

### Search
- Case-insensitive regex search
- Searches: name and description fields

### Sorting
- `sortBy` - Field to sort (default: createdAt)
- `sortOrder` - "asc" or "desc" (default: desc)

### Soft Delete
- Records marked as deleted, not removed
- All queries automatically exclude deleted records
- Permanent deletion excluded by design

### Validation
- DTO-level validation
- Database relationship validation
- **Critical**: Course SubCategories must belong to Course Categories

## ⚠️ Critical Validation Rules

### Course Creation/Update
❌ **INVALID**: Subcategories from different category than selected categories
✅ **VALID**: All subcategories belong to at least one selected category

```javascript
// FAILS
{
  categories: ["Web Development"],      // Contains JavaScript
  subCategories: ["React Native"]        // Belongs to Mobile!
}

// PASSES
{
  categories: ["Web Development", "Mobile Development"],
  subCategories: ["React Native"]        // Belongs to Mobile ✅
}
```

## 📊 Response Format

### Success (201 Created / 200 OK)
```json
{
  "statusCode": 201,
  "message": "Entity created successfully",
  "data": { /* entity */ }
}
```

### Paginated Response (200 OK)
```json
{
  "statusCode": 200,
  "message": "Entities retrieved successfully",
  "data": {
    "data": [ /* entities */ ],
    "total": 25,
    "skip": 0,
    "limit": 10,
    "hasMore": true
  }
}
```

### Error (400 Bad Request / 404 Not Found)
```json
{
  "statusCode": 400,
  "message": "Error message",
  "errors": ["Details"],
  "timestamp": "2024-01-17T10:00:00Z"
}
```

## 🧪 Testing Commands

```bash
# Run all tests
npm run test:e2e

# Run with watch mode
npm run test:watch

# Generate coverage report
npm run test:cov
```

## 🏗️ Project Structure

```
src/
├── modules/
│   ├── category/          ← Category CRUD + aggregation
│   ├── subcategory/       ← SubCategory CRUD + category validation
│   └── course/            ← Course CRUD + critical relationship validation
├── common/
│   ├── dto/               ← Pagination utilities
│   ├── exceptions/        ← Global error handling
│   └── helpers/           ← MongoDB aggregation utilities
├── app.module.ts          ← Root module
└── main.ts                ← Entry point
```

## 📋 Module Exports

All services are exported for dependency injection:

```typescript
// CategoryModule exports CategoryService
// SubCategoryModule exports SubCategoryService & imports CategoryModule
// CourseModule exports CourseService & imports CategoryModule + SubCategoryModule
```

## 🔍 Debugging Tips

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongod

# Verify MONGODB_URI in .env
MONGODB_URI=mongodb://localhost:27017/lms-db
```

### Validation Errors
- Check required fields are provided
- Verify ObjectId format: `507f1f77bcf86cd799439011`
- Check enum values: "beginner", "intermediate", "advanced"

### Relationship Errors
- Ensure category exists before creating subcategory
- Ensure all subcategories belong to selected categories for course

### Soft Delete Issues
- Deleted records return 404 (by design)
- To restore, use MongoDB:
  ```javascript
  db.categories.updateOne(
    { _id: ObjectId("..."), isDeleted: true },
    { $set: { isDeleted: false, deletedAt: null } }
  )
  ```

## 📦 Dependencies

### Core
- `@nestjs/common`, `@nestjs/core` - NestJS framework
- `@nestjs/mongoose`, `mongoose` - MongoDB/Mongoose
- `@nestjs/config` - Environment configuration

### Validation
- `class-validator` - DTO validation
- `class-transformer` - Data transformation

### Development
- `typescript`, `jest`, `supertest` - Testing

## 🚢 Production Deployment

```bash
# Build
npm run build

# Run production build
npm run start:prod
```

## 📞 Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Connection refused | Ensure MongoDB is running: `mongod` |
| 404 on created entity | Entity was soft deleted (check isDeleted=false filter) |
| Validation error on course | Check all subCategories belong to selected categories |
| Port already in use | Change PORT in .env or: `lsof -i :3000` then kill process |
| Unknown field error | DTOs use whitelist mode, only send valid fields |

## 💡 Pro Tips

1. **Use Postman/Insomnia**: Test API with UI client
2. **Check MongoDB Compass**: Visual MongoDB database browser
3. **Use aggregation queries**: `MONGODB_QUERIES.md` has examples
4. **Enable request logging**: Add middleware to main.ts
5. **Use seed script**: Create sample data for testing

## 🔗 Additional Resources

- NestJS: https://docs.nestjs.com
- Mongoose: https://mongoosejs.com
- MongoDB: https://docs.mongodb.com
- class-validator: https://github.com/typestack/class-validator

## ✅ Implementation Status

All requirements implemented and tested:
- ✅ CRUD Operations (18 endpoints)
- ✅ Relationship Validation (critical checks)
- ✅ Pagination, Sorting, Filtering, Search
- ✅ Soft Delete
- ✅ MongoDB Aggregation
- ✅ Code Quality Standards
- ✅ Comprehensive Documentation

**Ready for production use!** 🚀
