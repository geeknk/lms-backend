/**
 * MongoDB Aggregation Utilities
 * This file contains reusable aggregation pipelines for common operations
 */

/**
 * Aggregation pipeline to get Categories with SubCategory count
 * Returns each category with the count of associated subcategories
 */
export const getCategoriesWithSubcategoryCount = () => {
  return [
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
  ];
};

/**
 * Aggregation pipeline to get Courses with detailed Category and SubCategory information
 */
export const getCoursesWithDetails = () => {
  return [
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
      $addFields: {
        categoryCount: { $size: '$categoryDetails' },
        subCategoryCount: { $size: '$subCategoryDetails' },
      },
    },
    {
      $project: {
        name: 1,
        description: 1,
        duration: 1,
        level: 1,
        categoryCount: 1,
        subCategoryCount: 1,
        categories: 1,
        subCategories: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ];
};

/**
 * Aggregation pipeline to get SubCategories grouped by Category
 */
export const getSubCategoriesByCategory = () => {
  return [
    { $match: { isDeleted: false } },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo',
      },
    },
    {
      $unwind: '$categoryInfo',
    },
    {
      $group: {
        _id: '$categoryInfo._id',
        categoryName: { $first: '$categoryInfo.name' },
        subCategories: {
          $push: {
            _id: '$_id',
            name: '$name',
            description: '$description',
          },
        },
        totalSubCategories: { $sum: 1 },
      },
    },
    {
      $sort: { categoryName: 1 },
    },
  ];
};

/**
 * Aggregation pipeline to get Courses grouped by Level with count
 */
export const getCoursesByLevel = () => {
  return [
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$level',
        courses: {
          $push: {
            _id: '$_id',
            name: '$name',
            description: '$description',
            duration: '$duration',
          },
        },
        totalCourses: { $sum: 1 },
        averageDuration: { $avg: '$duration' },
      },
    },
    {
      $sort: { totalCourses: -1 },
    },
  ];
};

/**
 * Aggregation pipeline to get detailed statistics
 */
export const getStatistics = () => {
  return [
    {
      $facet: {
        categoryStats: [
          { $match: { isDeleted: false } },
          {
            $count: 'total',
          },
        ],
        courseStats: [
          { $match: { isDeleted: false } },
          {
            $group: {
              _id: null,
              totalCourses: { $sum: 1 },
              averageDuration: { $avg: '$duration' },
              maxDuration: { $max: '$duration' },
              minDuration: { $min: '$duration' },
            },
          },
        ],
      },
    },
  ];
};
