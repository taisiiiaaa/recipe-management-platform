import { Controller, Post, Body, Get, Param, UseGuards, Delete, UseInterceptors, UploadedFile, Put, Patch, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { Express } from 'express';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';  
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { UserDecorator } from '../common/decorators/user.decorator';  
import { User as UserEntity } from '../users/entities/user.entity';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { ParseIntPipe } from '@nestjs/common';
import { FindRecipesDto } from './dto/find-recipes.dto';
import { UpdateRecipeStatusDto } from './dto/update-recipe-status.dto';
import { plainToInstance } from 'class-transformer';
import { validateOrReject } from 'class-validator';
import { OptionalJwtAuthGuard } from 'src/auth/optional-jwt-auth.guard';

@ApiBearerAuth('access-token')
@ApiTags('recipes')
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiOperation({ summary: 'Update the status (is_public) of a recipe by ID' })
  @ApiResponse({ status: 200, description: 'Successfully updated recipe status.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRecipeStatusDto,
    @UserDecorator() user: UserEntity
  ) {
    return this.recipesService.updateStatus(id, dto.is_public, user);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new recipe' })
  @ApiResponse({
    status: 201,
    description: 'The recipe has been successfully created.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async create(
    @Body() createRecipeDto: any,
    @UserDecorator() user: UserEntity, 
    @UploadedFile() file: Express.Multer.File
  ) {    
    if (typeof createRecipeDto.is_public === 'string') {
      createRecipeDto.is_public = createRecipeDto.is_public === 'true';
    }

    if (typeof createRecipeDto.ingredients === 'string') {
      try {
        createRecipeDto.ingredients = JSON.parse(createRecipeDto.ingredients);
      } catch (err) {
        throw new BadRequestException('Invalid ingredients format');
      }
    }

    const imagePath = file ? file.filename : null;
    return this.recipesService.create(createRecipeDto, user, imagePath);  
  }

  @UseGuards(JwtAuthGuard)
  @Get('mine')
  @ApiQuery({ name: 'search', required: false, description: 'Search by recipe name' })
  @ApiOperation({ summary: 'Get all recipes created by the logged-in user' })
  async findMyRecipes(
    @UserDecorator() user: UserEntity, 
    @Query() filters: FindRecipesDto,
    @Query('searchTerm') search?: string
  ) {
    if (search && search.trim().length > 0) {
      return this.recipesService.searchByName(search, user);
    }

    return this.recipesService.findMyRecipes(user, filters);  
  }

  @Get('recipes')
  @ApiQuery({ name: 'search', required: false, description: 'Search by recipe name' })
  @ApiQuery({ name: 'ingredients', required: false, description: 'Filter by ingredients (comma separated)' })
  @ApiOperation({ summary: 'Get all recipes with optional filters' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved all recipes.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(
    @UserDecorator() user?: UserEntity,
    @Query() filters?: FindRecipesDto,
    @Query('search') search?: string,
    @Query('ingredients') ingredients?: string,
  ) {
    if (search && search.trim().length > 0) {
      return this.recipesService.searchByName(search, user);
    }

    if (ingredients && ingredients.trim().length > 0) {
      const ingredientList = ingredients.split(',').map(i => i.trim());
      return this.recipesService.findByIngredients(ingredientList, user);
    }

    return this.recipesService.findAll(user, filters);  
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Get(':id/view')
  @ApiOperation({ summary: 'View a recipe by ID (public or own private)' })
  @ApiResponse({ status: 200, description: 'Successfully viewed recipe' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async viewOne(@Param('id') id: number, @UserDecorator() user?: UserEntity) {
    return this.recipesService.findOne(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOperation({ summary: 'Get a recipe for editing (only creator)' })
  @ApiResponse({ status: 200, description: 'Recipe ready to edit' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Not found' })
  async findOneForEdit(@Param('id') id: number, @UserDecorator() user: UserEntity) {
    return this.recipesService.findOneForEdit(id, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiResponse({
    status: 200,
    description: 'Successfully deleted the recipe.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  @ApiOperation({ summary: 'Delete your own recipe' })
  remove(@Param('id') id: number, @UserDecorator() user: UserEntity): Promise<void> {
    return this.recipesService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @UseInterceptors(
    FileInterceptor('image', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  @ApiOperation({ summary: 'Update a recipe by ID' })
  @ApiResponse({ status: 200, description: 'Successfully updated the recipe.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Recipe not found' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() rawBody: any,
    @UserDecorator() user: UserEntity,
    @UploadedFile() file?: Express.Multer.File
  ) {
    if (typeof rawBody.is_public === 'string') {
      rawBody.is_public = rawBody.is_public === 'true';
    }

    if (typeof rawBody.ingredients === 'string') {
      try {
        rawBody.ingredients = JSON.parse(rawBody.ingredients);
      } catch (e) {
        throw new BadRequestException('Invalid JSON for ingredients');
      }
    }

    const dto = plainToInstance(UpdateRecipeDto, rawBody);

    await validateOrReject(dto);
    
    const imagePath = file ? file.filename : null;
    return this.recipesService.update(id, dto, user, imagePath);
  }
}

