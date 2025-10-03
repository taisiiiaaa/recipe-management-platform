import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Rating } from './entities/rating.entity';
import { Repository } from 'typeorm';
import { CreateRatingDto } from './dto/create-rating.dto';
import { User } from '../users/entities/user.entity';
import { Recipe } from '../recipes/entities/recipe.entity';

@Injectable()
export class RatingsService {
  constructor(
    @InjectRepository(Rating)
    private readonly ratingRepository: Repository<Rating>,
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
  ) {}

  async create(recipeId: number, user: User, createRatingDto: CreateRatingDto): Promise<Rating> {
    const recipe = await this.recipeRepository.findOne({ where: { id: recipeId } });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const existingRating = await this.ratingRepository.findOne({ where: { recipe: { id: recipeId }, user: { id: user.id } } });
    if (existingRating) {
      throw new ConflictException('You have already rated this recipe');
    }

    const rating = this.ratingRepository.create({
      value: createRatingDto.value,
      user,
      recipe,
    });

    return this.ratingRepository.save(rating);
  }

  async getAverageRating(recipeId: number): Promise<{ average: number; count: number }> {
    const { avg, count } = await this.ratingRepository
      .createQueryBuilder('rating')
      .select('AVG(rating.value)', 'avg')
      .addSelect('COUNT(rating.id)', 'count')
      .where('rating.recipeId = :recipeId', { recipeId })
      .getRawOne();

    return {
      average: parseFloat(avg) || 0,
      count: parseInt(count, 10) || 0,
    };
  }
}
