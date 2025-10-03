import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecipesService } from './recipes.service';
import { RecipesController } from './recipes.controller';
import { Recipe } from './entities/recipe.entity';
import { UsersModule } from '../users/users.module';
import { RecipeIngredient } from 'src/recipe-ingredients/entities/recipe-ingredient.entity';
import { RecipeIngredientsModule } from 'src/recipe-ingredients/recipe-ingredients.module';
import { IngredientsModule } from 'src/ingredients/ingredients.module';
import { Category } from 'src/categories/entities/categories.entity';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Recipe]), 
    UsersModule, 
    JwtModule,
    TypeOrmModule.forFeature([Recipe, RecipeIngredient]),
    RecipeIngredientsModule,
    Category,
    Ingredient,
    IngredientsModule],
  providers: [RecipesService],
  controllers: [RecipesController],
  exports: [RecipesService],
})
export class RecipesModule {}
