import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ClientSession } from 'mongoose';
import { Course, CourseDocument } from './schemas/course.schema';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CategoryService } from '../category/category.service';
import { SubCategoryService } from '../subcategory/subcategory.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course.name) private courseModel: Model<CourseDocument>,
    private categoryService: CategoryService,
    private subCategoryService: SubCategoryService,
  ) {}

  async validateSubCategoriesInCategories(
    categoryIds: string[],
    subCategoryIds: string[],
  ): Promise<void> {
    // Get all subcategories
    const subcategories =
      await this.subCategoryService.findByIds(subCategoryIds);

    if (subcategories.length !== subCategoryIds.length) {
      throw new BadRequestException('One or more SubCategories not found');
    }

    // Check if all subcategories belong to the provided categories
    const invalidSubcategories = subcategories.filter(
      (sub) => !categoryIds.includes(sub.category.toString()),
    );

    if (invalidSubcategories.length > 0) {
      throw new BadRequestException(
        'All selected SubCategories must belong to the selected Categories',
      );
    }
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    // Validate all categories exist
    for (const categoryId of createCourseDto.categories) {
      await this.categoryService.findById(categoryId);
    }

    // Validate all subcategories exist and belong to selected categories
    await this.validateSubCategoriesInCategories(
      createCourseDto.categories,
      createCourseDto.subCategories,
    );

    // Check if course name already exists
    const existing = await this.courseModel.findOne({
      name: createCourseDto.name,
      isDeleted: false,
    });

    if (existing) {
      throw new BadRequestException('Course name already exists');
    }

    const course = new this.courseModel(createCourseDto);
    return course.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<Course>> {
    const {
      skip = 0,
      limit = 10,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationDto;

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
      this.courseModel
        .find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('categories', 'name')
        .populate('subCategories', 'name category'),
      this.courseModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      skip,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async findById(id: string): Promise<Course> {
    const course = await this.courseModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('categories', 'name')
      .populate('subCategories', 'name category');

    if (!course) {
      throw new NotFoundException(`Course with ID ${id} not found`);
    }

    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findById(id);

    // Validate categories and subcategories if provided
    if (updateCourseDto.categories && updateCourseDto.subCategories) {
      for (const categoryId of updateCourseDto.categories) {
        await this.categoryService.findById(categoryId);
      }

      await this.validateSubCategoriesInCategories(
        updateCourseDto.categories,
        updateCourseDto.subCategories,
      );
    } else if (updateCourseDto.categories) {
      for (const categoryId of updateCourseDto.categories) {
        await this.categoryService.findById(categoryId);
      }

      await this.validateSubCategoriesInCategories(
        updateCourseDto.categories,
        course.subCategories.map((s) => s._id.toString()),
      );
    } else if (updateCourseDto.subCategories) {
      await this.validateSubCategoriesInCategories(
        course.categories.map((c) => c._id.toString()),
        updateCourseDto.subCategories,
      );
    }

    // Check if course name already exists (if being updated)
    if (updateCourseDto.name && updateCourseDto.name !== course.name) {
      const existing = await this.courseModel.findOne({
        name: updateCourseDto.name,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existing) {
        throw new BadRequestException('Course name already exists');
      }
    }

    Object.assign(course, updateCourseDto);
    return course.save();
  }

  async remove(id: string): Promise<Course> {
    const course = await this.findById(id);
    course.isDeleted = true;
    course.deletedAt = new Date();
    return course.save();
  }

  async findByCategory(categoryId: string): Promise<Course[]> {
    return this.courseModel
      .find({
        categories: categoryId,
        isDeleted: false,
      })
      .populate('categories', 'name')
      .populate('subCategories', 'name');
  }

  async findBySubCategory(subCategoryId: string): Promise<Course[]> {
    return this.courseModel
      .find({
        subCategories: subCategoryId,
        isDeleted: false,
      })
      .populate('categories', 'name')
      .populate('subCategories', 'name');
  }
}
