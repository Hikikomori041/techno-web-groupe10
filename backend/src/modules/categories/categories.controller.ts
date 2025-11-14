import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Role } from '../../common/enums/role.enum';
import { CategoryMapper } from './mappers/category.mapper';
import { CategoryResponseDto } from './dto/category-response.dto';
import {
  GetAllCategoriesDocs,
  GetCategoryByIdDocs,
  CreateCategoryDocs,
  UpdateCategoryDocs,
  DeleteCategoryDocs,
} from './categories.swagger';

@ApiTags('categories')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @GetAllCategoriesDocs()
  async findAll(): Promise<CategoryResponseDto[]> {
    const categories = await this.categoriesService.findAll();
    return CategoryMapper.toResponseList(categories);
  }

  @Get(':id')
  @GetCategoryByIdDocs()
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.findOne(id);
    return CategoryMapper.toResponse(category);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @CreateCategoryDocs()
  async create(@Body() createCategoryDto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const input = CategoryMapper.toCreateInput(createCategoryDto);
    const category = await this.categoriesService.create(input);
    return CategoryMapper.toResponse(category);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @UpdateCategoryDocs()
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    const input = CategoryMapper.toUpdateInput(updateCategoryDto);
    const category = await this.categoriesService.update(id, input);
    return CategoryMapper.toResponse(category);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @DeleteCategoryDocs()
  async remove(@Param('id') id: string): Promise<CategoryResponseDto> {
    const category = await this.categoriesService.remove(id);
    return CategoryMapper.toResponse(category);
  }
}

