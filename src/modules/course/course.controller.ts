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
import { CourseService } from './course.service';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { AllExceptionsFilter } from '../../common/exceptions/api-exception.filter';

@Controller('api/courses')
@UseFilters(AllExceptionsFilter)
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto) {
    const course = await this.courseService.create(createCourseDto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Course created successfully',
      data: course,
    };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    const result = await this.courseService.findAll(paginationDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Courses retrieved successfully',
      data: result,
    };
  }

  @Get(':id')
  async findById(@Param('id') id: string) {
    const course = await this.courseService.findById(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course retrieved successfully',
      data: course,
    };
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    const course = await this.courseService.update(id, updateCourseDto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course updated successfully',
      data: course,
    };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.courseService.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Course deleted successfully',
    };
  }

  @Get('by-category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    const courses = await this.courseService.findByCategory(categoryId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Courses retrieved successfully',
      data: courses,
    };
  }

  @Get('by-subcategory/:subCategoryId')
  async findBySubCategory(@Param('subCategoryId') subCategoryId: string) {
    const courses = await this.courseService.findBySubCategory(subCategoryId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Courses retrieved successfully',
      data: courses,
    };
  }
}
