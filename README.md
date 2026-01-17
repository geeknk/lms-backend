<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## LMS Backend - NestJS MongoDB API

A comprehensive Learning Management System backend built with NestJS and MongoDB, featuring complete CRUD operations for Categories, SubCategories, and Courses with advanced features like pagination, soft delete, relationship validation, and MongoDB aggregations.

## Quick Start

### Prerequisites
- Node.js >= 18.x
- MongoDB >= 5.0
- npm or yarn

### Installation & Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create `.env` file** from `.env.example`
   ```bash
   cp .env.example .env
   ```

3. **Update MongoDB URI in `.env`** (if needed)
   ```
   MONGODB_URI=mongodb://localhost:27017/lms-db
   PORT=3000
   ```

4. **Start MongoDB**
   ```bash
   mongod
   ```

5. **Run development server**
   ```bash
   npm run start:dev
   ```

The API will be available at `http://localhost:3000`

## Features

✅ **CRUD Operations** - Full CRUD for Category, SubCategory, and Course  
✅ **Relationship Validation** - SubCategory → Category, Course → Categories & SubCategories  
✅ **Advanced Listing** - Pagination, Sorting, Filtering, Search  
✅ **Soft Delete** - Non-destructive deletion with `isDeleted` flag  
✅ **MongoDB Aggregation** - Category with SubCategory count  
✅ **DTO Validation** - class-validator and class-transformer  
✅ **Error Handling** - Unified exception handling with proper HTTP status codes  
✅ **API Documentation** - Complete OpenAPI-ready endpoints  

## API Endpoints

### Categories
- `POST /api/categories` - Create
- `GET /api/categories` - List with pagination & search
- `GET /api/categories/:id` - Get by ID
- `GET /api/categories/with-subcategory-count` - Aggregation (categories with count)
- `PUT /api/categories/:id` - Update
- `DELETE /api/categories/:id` - Soft delete

### SubCategories
- `POST /api/subcategories` - Create
- `GET /api/subcategories` - List with pagination & search
- `GET /api/subcategories/:id` - Get by ID
- `PUT /api/subcategories/:id` - Update
- `DELETE /api/subcategories/:id` - Soft delete

### Courses
- `POST /api/courses` - Create
- `GET /api/courses` - List with pagination & search
- `GET /api/courses/:id` - Get by ID
- `GET /api/courses/by-category/:categoryId` - Get by category
- `GET /api/courses/by-subcategory/:subCategoryId` - Get by subcategory
- `PUT /api/courses/:id` - Update
- `DELETE /api/courses/:id` - Soft delete

## Documentation

- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)** - Complete API reference with examples
- **[SETUP_GUIDE.md](./SETUP_GUIDE.md)** - Implementation details and architecture

## Developmentbash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://kamilmysliwiec.com)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](LICENSE).
