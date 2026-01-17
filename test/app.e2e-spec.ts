import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('LMS Backend E2E Tests', () => {
  let app: INestApplication;
  let categoryId: string;
  let subCategoryId: string;
  let courseId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('Category Module (e2e)', () => {
    describe('POST /api/categories', () => {
      it('should create a category', () => {
        return request(app.getHttpServer())
          .post('/api/categories')
          .send({
            name: 'Web Development',
            description: 'Learn web development',
          })
          .expect(201)
          .then((res) => {
            expect(res.body.statusCode).toBe(201);
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.name).toBe('Web Development');
            categoryId = res.body.data._id;
          });
      });

      it('should fail on duplicate category name', () => {
        return request(app.getHttpServer())
          .post('/api/categories')
          .send({
            name: 'Web Development',
            description: 'Another description',
          })
          .expect(400);
      });

      it('should fail on invalid data', () => {
        return request(app.getHttpServer())
          .post('/api/categories')
          .send({
            name: 'W', // Too short
          })
          .expect(400);
      });
    });

    describe('GET /api/categories', () => {
      it('should retrieve all categories', () => {
        return request(app.getHttpServer())
          .get('/api/categories')
          .expect(200)
          .then((res) => {
            expect(res.body.statusCode).toBe(200);
            expect(res.body.data.data).toBeInstanceOf(Array);
            expect(res.body.data.total).toBeGreaterThanOrEqual(0);
          });
      });

      it('should support search', () => {
        return request(app.getHttpServer())
          .get('/api/categories')
          .query({ search: 'Web' })
          .expect(200)
          .then((res) => {
            expect(res.body.statusCode).toBe(200);
          });
      });

      it('should support pagination', () => {
        return request(app.getHttpServer())
          .get('/api/categories')
          .query({ skip: 0, limit: 5 })
          .expect(200)
          .then((res) => {
            expect(res.body.data.skip).toBe(0);
            expect(res.body.data.limit).toBe(5);
          });
      });
    });

    describe('GET /api/categories/:id', () => {
      it('should retrieve a category by id', () => {
        return request(app.getHttpServer())
          .get(`/api/categories/${categoryId}`)
          .expect(200)
          .then((res) => {
            expect(res.body.data._id).toBe(categoryId);
            expect(res.body.data.name).toBe('Web Development');
          });
      });

      it('should return 404 for non-existent category', () => {
        return request(app.getHttpServer())
          .get('/api/categories/507f1f77bcf86cd799439999')
          .expect(404);
      });
    });

    describe('PUT /api/categories/:id', () => {
      it('should update a category', () => {
        return request(app.getHttpServer())
          .put(`/api/categories/${categoryId}`)
          .send({
            name: 'Advanced Web Development',
          })
          .expect(200)
          .then((res) => {
            expect(res.body.data.name).toBe('Advanced Web Development');
          });
      });
    });

    describe('GET /api/categories/with-subcategory-count', () => {
      it('should retrieve categories with subcategory count', () => {
        return request(app.getHttpServer())
          .get('/api/categories/with-subcategory-count')
          .expect(200)
          .then((res) => {
            expect(res.body.data).toBeInstanceOf(Array);
          });
      });
    });
  });

  describe('SubCategory Module (e2e)', () => {
    describe('POST /api/subcategories', () => {
      it('should create a subcategory', () => {
        return request(app.getHttpServer())
          .post('/api/subcategories')
          .send({
            name: 'JavaScript',
            description: 'Learn JavaScript',
            category: categoryId,
          })
          .expect(201)
          .then((res) => {
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.name).toBe('JavaScript');
            subCategoryId = res.body.data._id;
          });
      });

      it('should fail with non-existent category', () => {
        return request(app.getHttpServer())
          .post('/api/subcategories')
          .send({
            name: 'React',
            description: 'Learn React',
            category: '507f1f77bcf86cd799439999',
          })
          .expect(404);
      });
    });

    describe('GET /api/subcategories', () => {
      it('should retrieve all subcategories', () => {
        return request(app.getHttpServer())
          .get('/api/subcategories')
          .expect(200)
          .then((res) => {
            expect(res.body.data.data).toBeInstanceOf(Array);
          });
      });
    });

    describe('GET /api/subcategories/:id', () => {
      it('should retrieve a subcategory by id', () => {
        return request(app.getHttpServer())
          .get(`/api/subcategories/${subCategoryId}`)
          .expect(200)
          .then((res) => {
            expect(res.body.data._id).toBe(subCategoryId);
          });
      });
    });
  });

  describe('Course Module (e2e)', () => {
    describe('POST /api/courses', () => {
      it('should create a course', () => {
        return request(app.getHttpServer())
          .post('/api/courses')
          .send({
            name: 'Full Stack Web Development',
            description: 'Complete course',
            duration: 120,
            level: 'intermediate',
            categories: [categoryId],
            subCategories: [subCategoryId],
          })
          .expect(201)
          .then((res) => {
            expect(res.body.data._id).toBeDefined();
            expect(res.body.data.name).toBe('Full Stack Web Development');
            courseId = res.body.data._id;
          });
      });

      it('should fail when subcategory does not belong to category', () => {
        // Create another category
        return request(app.getHttpServer())
          .post('/api/categories')
          .send({
            name: 'Mobile Development',
            description: 'Mobile dev',
          })
          .then((res) => {
            const differentCategoryId = res.body.data._id;

            // Try to create course with subcategory from different category
            return request(app.getHttpServer())
              .post('/api/courses')
              .send({
                name: 'Invalid Course',
                description: 'This should fail',
                duration: 100,
                level: 'beginner',
                categories: [differentCategoryId],
                subCategories: [subCategoryId], // This belongs to categoryId, not differentCategoryId
              })
              .expect(400);
          });
      });
    });

    describe('GET /api/courses', () => {
      it('should retrieve all courses', () => {
        return request(app.getHttpServer())
          .get('/api/courses')
          .expect(200)
          .then((res) => {
            expect(res.body.data.data).toBeInstanceOf(Array);
          });
      });
    });

    describe('GET /api/courses/:id', () => {
      it('should retrieve a course by id', () => {
        return request(app.getHttpServer())
          .get(`/api/courses/${courseId}`)
          .expect(200)
          .then((res) => {
            expect(res.body.data._id).toBe(courseId);
          });
      });
    });

    describe('GET /api/courses/by-category/:categoryId', () => {
      it('should retrieve courses by category', () => {
        return request(app.getHttpServer())
          .get(`/api/courses/by-category/${categoryId}`)
          .expect(200)
          .then((res) => {
            expect(res.body.data).toBeInstanceOf(Array);
          });
      });
    });

    describe('DELETE /api/courses/:id', () => {
      it('should soft delete a course', () => {
        return request(app.getHttpServer())
          .delete(`/api/courses/${courseId}`)
          .expect(200)
          .then((res) => {
            expect(res.body.statusCode).toBe(200);
          });
      });

      it('should not find deleted course', () => {
        return request(app.getHttpServer())
          .get(`/api/courses/${courseId}`)
          .expect(404);
      });
    });
  });
});
