import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private commentsRepository: Repository<Comment>,
    @InjectRepository(Recipe)
    private recipesRepository: Repository<Recipe>,
  ) {}

  async create(
    recipeId: number,
    user: User,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const recipe = await this.recipesRepository.findOneBy({ id: recipeId });
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }

    const comment = this.commentsRepository.create({
      content: createCommentDto.content,
      user,
      recipe,
    });

    return this.commentsRepository.save(comment);
  }

  async findByRecipe(recipeId: number): Promise<Comment[]> {
    return this.commentsRepository.find({
      where: { recipe: { id: recipeId } },
      order: { createdAt: 'DESC' },
    });
  }
}
