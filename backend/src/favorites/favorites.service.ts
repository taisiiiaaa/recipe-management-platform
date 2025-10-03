import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FavoritesService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async addFavorite(userId: number, recipeId: number): Promise<void> {
    if (isNaN(recipeId)) {
      throw new BadRequestException('Invalid recipe ID');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteRecipes'],
    });
    const recipe = await this.recipeRepository.findOne({
      where: { id: recipeId },
    });

    if (!user || !recipe) {
      throw new NotFoundException('User or Recipe not found');
    }

    user.favoriteRecipes.push(recipe);
    await this.userRepository.save(user);
  }

  async removeFavorite(userId: number, recipeId: number): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['favoriteRecipes'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.favoriteRecipes = user.favoriteRecipes.filter(
      (recipe) => recipe.id !== recipeId,
    );
    await this.userRepository.save(user);
  }

  async getFavorites(userId: number): Promise<Recipe[]> {
  const user = await this.userRepository.findOne({
    where: { id: userId },
    relations: ['favoriteRecipes'],
  });

  if (!user) {
    throw new NotFoundException('User not found');
  }

  const recipeIds = user.favoriteRecipes.map(r => r.id);

  if (recipeIds.length === 0) {
    return [];
  }

  const recipes = await this.recipeRepository
    .createQueryBuilder('recipe')
    .leftJoinAndSelect('recipe.user', 'user')
    .leftJoinAndSelect('recipe.category', 'category')
    .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
    .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
    .leftJoinAndSelect('recipe.comments', 'comments')
    .leftJoinAndSelect('recipe.ratings', 'ratings')
    .where('recipe.id IN (:...ids)', { ids: recipeIds })
    .getMany();

    for (const recipe of recipes) {
      recipe.commentsCount = recipe.comments?.length || 0;

      const totalRating = recipe.ratings?.reduce((sum, r) => sum + (r.value || 0), 0) || 0;
      recipe.avgRating = recipe.ratings?.length ? totalRating / recipe.ratings.length : 0;
    }

    return recipes;
  }
}
