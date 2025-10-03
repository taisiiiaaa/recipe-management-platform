import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';

import { User } from './users/entities/user.entity';
import { Recipe } from './recipes/entities/recipe.entity';
import { Category } from './categories/entities/categories.entity';
import { Ingredient } from './ingredients/entities/ingredient.entity';
import { RecipeIngredient } from './recipe-ingredients/entities/recipe-ingredient.entity';
import { Rating } from './ratings/entities/rating.entity';
import { Comment } from './comments/entities/comment.entity';
import { UsersModule } from './users/users.module';
import { RecipesModule } from './recipes/recipes.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipeIngredientsModule } from './recipe-ingredients/recipe-ingredients.module';
import { CategoriesModule } from './categories/category.module';
import { FavoritesModule } from './favorites/favorites.module';
import { CommentsModule } from './comments/comments.module';
import { RatingsModule } from './ratings/ratings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: Number(process.env.DATABASE_PORT) || 5433,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD || 'recipe',
      database: process.env.DATABASE_NAME || 'recipe-management',
      entities: [
        User,
        Recipe,
        Category,
        Ingredient,
        Rating,
        Comment,
        RecipeIngredient,
      ],
      synchronize: true, 
      dropSchema: false,
      logging: true
    }),
    UsersModule,
    RecipesModule,
    AuthModule,
    IngredientsModule,
    RecipeIngredientsModule,
    CategoriesModule,
    FavoritesModule,
    CommentsModule,
    RatingsModule
  ],
})
export class AppModule {}
