import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SubCategory, SubCategoryDocument } from './schemas/subcategory.schema';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
} from './dto/subcategory.dto';
import { PaginationDto, PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CategoryService } from '../category/category.service';

@Injectable()
export class SubCategoryService {
  constructor(
    @InjectModel(SubCategory.name)
    private subCategoryModel: Model<SubCategoryDocument>,
    private categoryService: CategoryService,
  ) {}

  async create(createSubCategoryDto: CreateSubCategoryDto): Promise<SubCategory> {
    // Validate category exists
    await this.categoryService.findById(createSubCategoryDto.category);

    const subcategory = new this.subCategoryModel(createSubCategoryDto);
    return subcategory.save();
  }

  async findAll(
    paginationDto: PaginationDto,
  ): Promise<PaginatedResponseDto<SubCategory>> {
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
      this.subCategoryModel
        .find(filter)
        .sort(sortQuery)
        .skip(skip)
        .limit(limit)
        .populate('category', 'name'),
      this.subCategoryModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      skip,
      limit,
      hasMore: skip + limit < total,
    };
  }

  async findById(id: string): Promise<SubCategory> {
    const subcategory = await this.subCategoryModel
      .findOne({
        _id: id,
        isDeleted: false,
      })
      .populate('category', 'name');

    if (!subcategory) {
      throw new NotFoundException(`SubCategory with ID ${id} not found`);
    }

    return subcategory;
  }

  async update(
    id: string,
    updateSubCategoryDto: UpdateSubCategoryDto,
  ): Promise<SubCategory> {
    const subcategory = await this.findById(id);

    if (
      updateSubCategoryDto.category &&
      updateSubCategoryDto.category !== subcategory.category.toString()
    ) {
      await this.categoryService.findById(updateSubCategoryDto.category);
    }

    Object.assign(subcategory, updateSubCategoryDto);
    return subcategory.save();
  }

  async remove(id: string): Promise<SubCategory> {
    const subcategory = await this.findById(id);
    subcategory.isDeleted = true;
    subcategory.deletedAt = new Date();
    return subcategory.save();
  }

  async findByIds(ids: string[]): Promise<SubCategory[]> {
    return this.subCategoryModel.find({
      _id: { $in: ids },
      isDeleted: false,
    });
  }

  async findByCategory(categoryId: string): Promise<SubCategory[]> {
    return this.subCategoryModel.find({
      category: categoryId,
      isDeleted: false,
    });
  }
}
