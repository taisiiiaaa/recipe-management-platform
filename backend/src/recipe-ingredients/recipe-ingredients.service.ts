import {
Injectable, NotFoundException, ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RecipeIngredient } from './entities/recipe-ingredient.entity';
import { CreateRecipeIngredientDto } from './dto/create-recipe-ingredient.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';
import { Recipe } from '../recipes/entities/recipe.entity';
import { User } from '../users/entities/user.entity';
import { Ingredient } from '../ingredients/entities/ingredient.entity';

@Injectable()
export class RecipeIngredientsService {
    constructor(
        @InjectRepository(RecipeIngredient)
        private recipeIngredientRepo: Repository<RecipeIngredient>,

        @InjectRepository(Recipe)
        private recipeRepo: Repository<Recipe>,

        @InjectRepository(Ingredient)
        private ingredientRepo: Repository<Ingredient>,
    ) {}

    async verifyOwnership(recipeId: number, user: User) {
        const recipe = await this.recipeRepo.findOne({
        where: { id: recipeId },
        relations: ['user'],
        });
        if (!recipe || recipe.user.id !== user.id) {
        throw new ForbiddenException('You do not own this recipe');
        }
        return recipe;
    }

    async addIngredient(recipeId: number, dto: CreateRecipeIngredientDto, user: User) {
        await this.verifyOwnership(recipeId, user);

        const ingredient = await this.ingredientRepo.findOneBy({ id: dto.ingredientId });
        if (!ingredient) throw new NotFoundException('Ingredient not found');

        const entry = this.recipeIngredientRepo.create({
        recipe_id: recipeId,
        ingredient_id: dto.ingredientId,
        quantity: dto.quantity,
        });

        return this.recipeIngredientRepo.save(entry);
    }

    async listIngredients(recipeId: number, user: User) {
        await this.verifyOwnership(recipeId, user);
        return this.recipeIngredientRepo.find({
        where: { recipe_id: recipeId },
        relations: ['ingredient'],
        });
    }

    async updateIngredient(recipeId: number, ingredientId: number, dto: UpdateIngredientDto, user: User) {
        await this.verifyOwnership(recipeId, user);

        const entry = await this.recipeIngredientRepo.findOne({
        where: { recipe_id: recipeId, ingredient_id: ingredientId },
        });

        if (!entry) throw new NotFoundException('Ingredient not linked to recipe');

        entry.quantity = dto.quantity;
        return this.recipeIngredientRepo.save(entry);
    }

    async removeIngredient(recipeId: number, ingredientId: number, user: User) {
        await this.verifyOwnership(recipeId, user);

        const result = await this.recipeIngredientRepo.delete({ recipe_id: recipeId, ingredient_id: ingredientId });
        if (result.affected === 0) {
        throw new NotFoundException('Ingredient not linked to recipe');
        }
    }
}
  