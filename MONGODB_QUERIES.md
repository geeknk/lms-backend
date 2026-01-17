# MongoDB Queries & Testing Guide

This file contains useful MongoDB queries for testing and maintaining the LMS database.

## Database Setup

### Create Database and Collections
```javascript
// Create database
use('lms-db')

// Create collections (automatic with first insert, but explicit creation is good practice)
db.createCollection('categories')
db.createCollection('subcategories')
db.createCollection('courses')

// Create indexes for better performance
db.categories.createIndex({ name: 1 }, { unique: true })
db.categories.createIndex({ isDeleted: 1 })
db.categories.createIndex({ createdAt: -1 })

db.subcategories.createIndex({ name: 1 })
db.subcategories.createIndex({ category: 1 })
db.subcategories.createIndex({ isDeleted: 1 })

db.courses.createIndex({ name: 1 }, { unique: true })
db.courses.createIndex({ categories: 1 })
db.courses.createIndex({ subCategories: 1 })
db.courses.createIndex({ isDeleted: 1 })
db.courses.createIndex({ level: 1 })
```

## Testing Queries

### Sample Data Insertion

**Insert Categories**
```javascript
db.categories.insertMany([
  {
    name: "Web Development",
    description: "Learn web development from basics to advanced",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Mobile Development",
    description: "Build native and cross-platform mobile apps",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Backend Development",
    description: "Server-side development and APIs",
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Get category IDs for next step
db.categories.find({ isDeleted: false }, { _id: 1, name: 1 })
```

**Insert SubCategories**
```javascript
// Replace with actual category IDs from above
const webCatId = ObjectId("..."); // Web Development
const mobileCatId = ObjectId("...");
const backendCatId = ObjectId("...");

db.subcategories.insertMany([
  // Web Development subcategories
  {
    name: "JavaScript",
    description: "JavaScript fundamentals and advanced concepts",
    category: webCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "React",
    description: "React framework and ecosystem",
    category: webCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "HTML & CSS",
    description: "Web basics",
    category: webCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Mobile Development subcategories
  {
    name: "React Native",
    description: "Cross-platform mobile development",
    category: mobileCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Flutter",
    description: "Flutter framework for mobile apps",
    category: mobileCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  // Backend Development subcategories
  {
    name: "Node.js",
    description: "Node.js and Express framework",
    category: backendCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "MongoDB",
    description: "MongoDB database and Mongoose ODM",
    category: backendCatId,
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])

// Get subcategory IDs
db.subcategories.find({ isDeleted: false }, { _id: 1, name: 1, category: 1 })
```

**Insert Courses**
```javascript
// Replace with actual IDs
const webCatId = ObjectId("...");
const backendCatId = ObjectId("...");
const jsSubId = ObjectId("...");
const htmlSubId = ObjectId("...");
const nodeSubId = ObjectId("...");
const mongoSubId = ObjectId("...");

db.courses.insertMany([
  {
    name: "Full Stack Web Development",
    description: "Complete web development course",
    duration: 120,
    level: "intermediate",
    categories: [webCatId, backendCatId],
    subCategories: [jsSubId, htmlSubId, nodeSubId, mongoSubId],
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "JavaScript Fundamentals",
    description: "Learn JavaScript basics",
    duration: 40,
    level: "beginner",
    categories: [webCatId],
    subCategories: [jsSubId],
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Backend with Node.js",
    description: "Build backend APIs with Node.js",
    duration: 60,
    level: "intermediate",
    categories: [backendCatId],
    subCategories: [nodeSubId, mongoSubId],
    isDeleted: false,
    createdAt: new Date(),
    updatedAt: new Date()
  }
])
```

## Aggregation Queries

### 1. Categories with SubCategory Count
```javascript
db.categories.aggregate([
  { $match: { isDeleted: false } },
  {
    $lookup: {
      from: "subcategories",
      localField: "_id",
      foreignField: "category",
      as: "subcategories"
    }
  },
  {
    $addFields: {
      subcategoryCount: {
        $size: {
          $filter: {
            input: "$subcategories",
            as: "sub",
            cond: { $eq: ["$$sub.isDeleted", false] }
          }
        }
      }
    }
  },
  {
    $project: {
      name: 1,
      description: 1,
      subcategoryCount: 1,
      createdAt: 1,
      updatedAt: 1,
      _id: 1
    }
  },
  { $sort: { createdAt: -1 } }
])
```

### 2. Courses with Full Details
```javascript
db.courses.aggregate([
  { $match: { isDeleted: false } },
  {
    $lookup: {
      from: "categories",
      localField: "categories",
      foreignField: "_id",
      as: "categoryDetails"
    }
  },
  {
    $lookup: {
      from: "subcategories",
      localField: "subCategories",
      foreignField: "_id",
      as: "subCategoryDetails"
    }
  },
  {
    $addFields: {
      categoryCount: { $size: "$categoryDetails" },
      subCategoryCount: { $size: "$subCategoryDetails" }
    }
  },
  {
    $project: {
      name: 1,
      description: 1,
      duration: 1,
      level: 1,
      categoryCount: 1,
      subCategoryCount: 1,
      categories: { name: 1 },
      subCategories: { name: 1 },
      createdAt: 1,
      updatedAt: 1
    }
  }
])
```

### 3. SubCategories Grouped by Category
```javascript
db.subcategories.aggregate([
  { $match: { isDeleted: false } },
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryInfo"
    }
  },
  { $unwind: "$categoryInfo" },
  {
    $group: {
      _id: "$categoryInfo._id",
      categoryName: { $first: "$categoryInfo.name" },
      subCategories: {
        $push: {
          _id: "$_id",
          name: "$name",
          description: "$description"
        }
      },
      totalSubCategories: { $sum: 1 }
    }
  },
  { $sort: { categoryName: 1 } }
])
```

### 4. Courses by Level with Statistics
```javascript
db.courses.aggregate([
  { $match: { isDeleted: false } },
  {
    $group: {
      _id: "$level",
      courses: {
        $push: {
          _id: "$_id",
          name: "$name",
          duration: "$duration"
        }
      },
      totalCourses: { $sum: 1 },
      averageDuration: { $avg: "$duration" },
      maxDuration: { $max: "$duration" },
      minDuration: { $min: "$duration" }
    }
  },
  { $sort: { totalCourses: -1 } }
])
```

### 5. Dashboard Statistics
```javascript
db.categories.aggregate([
  {
    $facet: {
      categoryStats: [
        { $match: { isDeleted: false } },
        { $count: "totalCategories" }
      ],
      subcategoryStats: [
        { $match: { isDeleted: false } },
        {
          $lookup: {
            from: "subcategories",
            localField: "_id",
            foreignField: "category",
            as: "subs"
          }
        },
        {
          $project: {
            count: {
              $size: {
                $filter: {
                  input: "$subs",
                  as: "s",
                  cond: { $eq: ["$$s.isDeleted", false] }
                }
              }
            }
          }
        },
        {
          $group: {
            _id: null,
            totalSubCategories: { $sum: "$count" }
          }
        }
      ],
      courseStats: [
        { $match: { isDeleted: false } },
        {
          $group: {
            _id: null,
            totalCourses: { $sum: 1 },
            averageDuration: { $avg: "$duration" },
            byLevel: {
              $push: {
                level: "$level",
                count: 1
              }
            }
          }
        }
      ]
    }
  }
])
```

## Search Queries

### Find by Name (Case-Insensitive)
```javascript
// Find category by name
db.categories.find({ name: { $regex: "web", $options: "i" }, isDeleted: false })

// Find courses with description containing keyword
db.courses.find({ 
  $or: [
    { name: { $regex: "javascript", $options: "i" } },
    { description: { $regex: "javascript", $options: "i" } }
  ],
  isDeleted: false
})
```

### Find Courses by Category
```javascript
db.courses.find(
  { categories: ObjectId("..."), isDeleted: false },
  { name: 1, description: 1, duration: 1, level: 1 }
)
```

### Find SubCategories by Category
```javascript
db.subcategories.find(
  { category: ObjectId("..."), isDeleted: false },
  { name: 1, description: 1 }
)
```

## Update Queries

### Update Category
```javascript
db.categories.updateOne(
  { _id: ObjectId("..."), isDeleted: false },
  {
    $set: {
      name: "Updated Name",
      description: "Updated description",
      updatedAt: new Date()
    }
  }
)
```

### Soft Delete (Mark as Deleted)
```javascript
// Delete category
db.categories.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  }
)

// Delete subcategory
db.subcategories.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  }
)

// Delete course
db.courses.updateOne(
  { _id: ObjectId("...") },
  {
    $set: {
      isDeleted: true,
      deletedAt: new Date()
    }
  }
)
```

### Restore Soft-Deleted Record
```javascript
db.categories.updateOne(
  { _id: ObjectId("..."), isDeleted: true },
  {
    $set: {
      isDeleted: false,
      deletedAt: null
    }
  }
)
```

## Count Queries

### Count Non-Deleted Records
```javascript
// Total categories
db.categories.countDocuments({ isDeleted: false })

// Total subcategories
db.subcategories.countDocuments({ isDeleted: false })

// Total courses
db.courses.countDocuments({ isDeleted: false })

// Courses by level
db.courses.countDocuments({ level: "beginner", isDeleted: false })
db.courses.countDocuments({ level: "intermediate", isDeleted: false })
db.courses.countDocuments({ level: "advanced", isDeleted: false })
```

## Data Cleanup Queries

### List All Deleted Records
```javascript
// Show all deleted categories
db.categories.find({ isDeleted: true })

// Show all deleted subcategories
db.subcategories.find({ isDeleted: true })

// Show all deleted courses
db.courses.find({ isDeleted: true })
```

### Permanently Delete Soft-Deleted Records (Use with Caution!)
```javascript
// Delete categories (archived older than 30 days)
db.categories.deleteMany({
  isDeleted: true,
  deletedAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
```

### Clear All Data (Development Only!)
```javascript
// WARNING: This will delete all data!
db.categories.deleteMany({})
db.subcategories.deleteMany({})
db.courses.deleteMany({})
```

## Validation Queries

### Verify Relationship Integrity
```javascript
// Find subcategories with non-existent category references
db.subcategories.aggregate([
  { $match: { isDeleted: false } },
  {
    $lookup: {
      from: "categories",
      localField: "category",
      foreignField: "_id",
      as: "categoryInfo"
    }
  },
  {
    $match: { categoryInfo: { $size: 0 } }
  }
])

// Find courses with invalid subcategory references
db.courses.aggregate([
  { $match: { isDeleted: false } },
  { $unwind: "$subCategories" },
  {
    $lookup: {
      from: "subcategories",
      localField: "subCategories",
      foreignField: "_id",
      as: "subInfo"
    }
  },
  {
    $match: { subInfo: { $size: 0 } }
  }
])
```

### Verify SubCategories Belong to Course Categories
```javascript
db.courses.aggregate([
  { $match: { isDeleted: false } },
  {
    $lookup: {
      from: "subcategories",
      localField: "subCategories",
      foreignField: "_id",
      as: "subCategoryDetails"
    }
  },
  {
    $project: {
      name: 1,
      categories: 1,
      subCategories: 1,
      mismatched: {
        $filter: {
          input: "$subCategoryDetails",
          as: "sub",
          cond: {
            $not: {
              $in: ["$$sub.category", "$categories"]
            }
          }
        }
      }
    }
  },
  { $match: { mismatched: { $size: { $gt: 0 } } } }
])
```

## Performance Monitoring

### Check Index Usage
```javascript
db.categories.aggregate([
  { $indexStats: {} }
])

db.subcategories.aggregate([
  { $indexStats: {} }
])

db.courses.aggregate([
  { $indexStats: {} }
])
```

### Query Explain Plan
```javascript
db.categories.find({ isDeleted: false }).explain("executionStats")
```

## Backup and Export

### Export Collections
```bash
# Export categories
mongoexport --uri "mongodb://localhost:27017/lms-db" \
  --collection categories \
  --out categories.json

# Export all collections
mongoexport --uri "mongodb://localhost:27017/lms-db" \
  --collection subcategories \
  --out subcategories.json

mongoexport --uri "mongodb://localhost:27017/lms-db" \
  --collection courses \
  --out courses.json
```

### Import Collections
```bash
mongoimport --uri "mongodb://localhost:27017/lms-db" \
  --collection categories \
  --file categories.json
```

## Testing Tips

1. **Always use separate test database**: `use('lms-db-test')`
2. **Test soft delete functionality**: Verify deleted records are excluded from queries
3. **Test relationship validation**: Ensure invalid references are caught
4. **Test aggregation pipeline**: Verify counts and groupings are correct
5. **Test pagination**: Verify skip/limit calculations
6. **Test search**: Verify regex search works case-insensitively
7. **Test sorting**: Verify correct order (ASC/DESC)
