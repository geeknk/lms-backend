import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<CategoryDocument>,
  ) {}

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const existing = await this.categoryModel.findOne({
      name: createCategoryDto.name,
      isDeleted: false,
    });

    if (existing) {
      throw new BadRequestException('Category name already exists');
    }

    const category = new this.categoryModel(createCategoryDto);
    return category.save();
  }

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
      this.categoryModel.find(filter).sort(sortQuery).limit(limit),
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

  async findById(id: string): Promise<Category> {
    const category = await this.categoryModel.findOne({
      _id: id,
      isDeleted: false,
    });

    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }

    return category;
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto): Promise<Category> {
    const category = await this.findById(id);

    if (updateCategoryDto.name && updateCategoryDto.name !== category.name) {
      const existing = await this.categoryModel.findOne({
        name: updateCategoryDto.name,
        isDeleted: false,
        _id: { $ne: id },
      });

      if (existing) {
        throw new BadRequestException('Category name already exists');
      }
    }

    Object.assign(category, updateCategoryDto);
    return category.save();
  }

  async remove(id: string): Promise<Category> {
    const category = await this.findById(id);
    category.isDeleted = true;
    category.deletedAt = new Date();
    return category.save();
  }

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
}
