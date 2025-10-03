import {
    Controller, Post, Get, Param, Delete, Put, Body, UseGuards
  } from '@nestjs/common';
  import { RecipeIngredientsService } from './recipe-ingredients.service';
  import { JwtAuthGuard } from '../auth/jwt-auth.guard';
  import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
  import { UserDecorator } from '../common/decorators/user.decorator';
  import { User as UserEntity } from '../users/entities/user.entity';
  import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto';
  import { UpdateIngredientDto } from './dto/update-ingredient.dto';
  
  @ApiTags('recipe-ingredients')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAuthGuard)
  @Controller('recipes/:recipeId/ingredients')
  export class RecipeIngredientsController {
    constructor(private readonly service: RecipeIngredientsService) {}
  
    @Post()
    async addIngredient(
      @Param('recipeId') recipeId: number,
      @Body() dto: CreateRecipeIngredientDto,
      @UserDecorator() user: UserEntity,
    ) {
      return this.service.addIngredient(recipeId, dto, user);
    }
  
    @Get()
    async listIngredients(
      @Param('recipeId') recipeId: number,
      @UserDecorator() user: UserEntity,
    ) {
      return this.service.listIngredients(recipeId, user);
    }
  
    @Put(':ingredientId')
    async updateQuantity(
      @Param('recipeId') recipeId: number,
      @Param('ingredientId') ingredientId: number,
      @Body() dto: UpdateIngredientDto,
      @UserDecorator() user: UserEntity,
    ) {
      return this.service.updateIngredient(recipeId, ingredientId, dto, user);
    }
  
    @Delete(':ingredientId')
    async removeIngredient(
      @Param('recipeId') recipeId: number,
      @Param('ingredientId') ingredientId: number,
      @UserDecorator() user: UserEntity,
    ) {
      return this.service.removeIngredient(recipeId, ingredientId, user);
    }
  }
  