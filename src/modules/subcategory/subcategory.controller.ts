import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  HttpStatus,
  UseFilters,
} from '@nestjs/common';
import { SubCategoryService } from './subcategory.service';
import {
  CreateSubCategoryDto,
  UpdateSubCategoryDto,
} from './dto/subcategory.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AllExceptionsFilter } from '../../common/exceptions/api-exception.filter';

@Controller('api/subcategories')
@UseFilters(AllExceptionsFilter)
export class SubCategoryController {
  constructor(private readonly subCategoryService: SubCategoryService) {}

  @Post()
  async create(@Body() createSubCategoryDto: CreateSubCategoryDto) {
    const subcategory =
      await this.subCategoryService.create(createSubCategoryDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'SubCategory created successfully',
      data: subcategory,
    };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.subCategoryService.findAll(paginationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategories retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const subcategory = await this.subCategoryService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory retrieved successfully',
      data: subcategory,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateSubCategoryDto: UpdateSubCategoryDto,
  ) {
    const subcategory = await this.subCategoryService.update(
      id,
      updateSubCategoryDto,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory updated successfully',
      data: subcategory,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.subCategoryService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'SubCategory deleted successfully',
    };
  }
}
