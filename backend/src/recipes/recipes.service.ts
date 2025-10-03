import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Recipe } from './entities/recipe.entity';
import { CreateRecipeDto } from './dto/create-recipe.dto';
import { UpdateRecipeDto } from './dto/update-recipe.dto';
import { User } from '../users/entities/user.entity'; 
import { RecipeIngredient } from '../recipe-ingredients/entities/recipe-ingredient.entity';
import { Category } from 'src/categories/entities/categories.entity';
import * as pluralize from 'pluralize';
import { Ingredient } from 'src/ingredients/entities/ingredient.entity';
import { FindRecipesDto } from './dto/find-recipes.dto';
import { ILike, Raw } from 'typeorm';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class RecipesService {
  // categoryRepository: any;
  constructor(
    @InjectRepository(Recipe)
    private readonly recipeRepository: Repository<Recipe>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RecipeIngredient)
    private readonly recipeIngredientRepository: Repository<RecipeIngredient>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(dto: CreateRecipeDto, user: User, imagePath: string | null) {
    const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
    if (!category) throw new NotFoundException('Category not found');

    const recipe = this.recipeRepository.create({
      ...dto,
      category,
      user: { id: user.id },
      imagePath: imagePath ?? undefined
    });
  
    const savedRecipe = await this.recipeRepository.save(recipe);

    if (dto.ingredients && dto.ingredients.length > 0) {
      for (const ingredientInput of dto.ingredients) {
        let rawName: string;

        if (typeof ingredientInput === 'string') {
          rawName = ingredientInput;
        } else {
          rawName = ingredientInput.name;
        }

        const normalizedName = pluralize.singular(rawName.trim().toLowerCase());

        let ingredient = await this.ingredientRepository.findOneBy({ name: normalizedName });

        if (!ingredient) {
          ingredient = this.ingredientRepository.create({ name: normalizedName });
          await this.ingredientRepository.save(ingredient);
        }

        const recipeIngredient = this.recipeIngredientRepository.create({
          recipe: savedRecipe,
          ingredient,
          quantity: ingredientInput.quantity || undefined,
        });

        await this.recipeIngredientRepository.save(recipeIngredient);
      }
    }

    const fullRecipe = await this.recipeRepository.findOne({
      where: { id: savedRecipe.id },
      relations: ['recipeIngredients', 'recipeIngredients.ingredient', 'category', 'user'],
    });

    if (!fullRecipe) throw new NotFoundException('Recipe not found after saving');

    return fullRecipe;
  }

  async updateStatus(id: number, is_public: boolean, user: User) {
    const recipe = await this.findOne(id, user);
    if (!recipe) {
      throw new NotFoundException('Recipe not found');
    }
    if (recipe.userId !== user.id) {
      throw new ForbiddenException('You are not allowed to update this recipe');
    }

    recipe.is_public = is_public;
    return this.recipeRepository.save(recipe);
  }

  async findAll(user?: User, filters?: FindRecipesDto): Promise<Recipe[]> {
    const query = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.category', 'category')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
      .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
      .leftJoin('recipe.ratings', 'rating')
      .leftJoin('recipe.comments', 'comment')
      .loadRelationCountAndMap('recipe.commentsCount', 'recipe.comments') 
      .addSelect('AVG(rating.value)', 'recipe_avgRating') 
      .groupBy('recipe.id')
      .addGroupBy('category.id')
      .addGroupBy('user.id')
      .addGroupBy('recipeIngredients.recipe_id')
      .addGroupBy('recipeIngredients.ingredient_id')
      .addGroupBy('ingredient.id');

    if (!user) {
      query.where('recipe.is_public = true');
    } else {
      query.where('recipe.is_public = true', {
        userId: user.id,
      });
    }

    if (filters?.categoryIds?.length) {
      console.log('Filtering by categoryIds:', filters.categoryIds);
      query.andWhere('category.id IN (:...categoryIds)', { categoryIds: filters.categoryIds });
    }

    if (filters?.difficulty) {
      query.andWhere('recipe.difficulty = :difficulty', { difficulty: filters.difficulty });
    }

    if (filters?.cookingTimeRange) {
      switch (filters.cookingTimeRange) {
        case '1-20':
          query.andWhere('recipe.cooking_time BETWEEN 1 AND 20');
          break;
        case '20-40':
          query.andWhere('recipe.cooking_time BETWEEN 20 AND 40');
          break;
        case '40-60':
          query.andWhere('recipe.cooking_time BETWEEN 40 AND 60');
          break;
        case '60+':
          query.andWhere('recipe.cooking_time > 60');
          break;
      }
    }

    // if (filters?.ingredientsQuery) {
    //   const terms = filters.ingredientsQuery
    //     .split(/[\s,]+/)
    //     .map(term => pluralize.singular(term.trim().toLowerCase()))
    //     .filter(term => term.length > 0);

    //   if (terms.length > 0) {
    //     query.andWhere('ingredient.name IN (:...terms)', { terms });
    //   }
    // }

    if (filters?.searchTerm) {
      const term = `%${filters.searchTerm.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(recipe.name) LIKE :term OR LOWER(ingredient.name) LIKE :term)`,
        { term }
      );
    }

    const userId = user?.id;
    const { entities, raw } = await query.getRawAndEntities();

    const favoriteIds = userId
      ? await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.favoriteRecipes', 'recipe')
          .where('user.id = :id', { id: userId })
          .getOne()
          .then(user => user?.favoriteRecipes?.map(r => r.id) ?? [])
      : [];

    return plainToInstance(Recipe, entities.map((recipe, index) => ({
      ...recipe,
      avgRating: parseFloat(raw[index].recipe_avgRating) || 0,
      isFavorite: favoriteIds.includes(recipe.id),
    })));
  }

  async findByIngredients(ingredients: string[], user?: User): Promise<Recipe[]> {
    if (ingredients.length === 0) return [];

    const normalized = ingredients
      .map(i => pluralize.singular(i.trim().toLowerCase()))
      .filter(i => i.length > 0);

    if (normalized.length === 0) return [];

    const query = this.recipeRepository.createQueryBuilder('recipe')
      .leftJoin('recipe.recipeIngredients', 'ri')
      .leftJoin('ri.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.category', 'category')
      .leftJoinAndSelect('recipe.user', 'user')
      .where('ingredient.name IN (:...names)', { names: normalized });

    if (!user) {
      query.andWhere('recipe.is_public = true');
    } else {
      query.andWhere('(recipe.is_public = true OR recipe.userId = :userId)', { userId: user.id });
    }

    query.groupBy('recipe.id')
      .addGroupBy('category.id')
      .addGroupBy('user.id')
      .orderBy('COUNT(DISTINCT ingredient.id)', 'DESC'); 

    const recipes = await query.getMany();

    return recipes;
  }

  async searchByName(term: string, user?: User): Promise<Recipe[]> {
    const query = this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
      .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.category', 'category');

    if (term.length < 3) {
      query.where('LOWER(recipe.name) LIKE LOWER(:ilikeTerm)', {
        ilikeTerm: `%${term}%`,
      });
    } else {
      query
        .where('recipe.name % LOWER(:term)', { term: term.toLowerCase() })
        .orderBy('similarity(LOWER(recipe.name), LOWER(:term))', 'DESC');
    }

    if (user) {
      query.andWhere('recipe.user_id = :userId', { userId: user.id });
    } else {
      query.andWhere('recipe.is_public = true');  
    }

    const recipes = await query.getMany();

    const userId = user?.id;

    const favoriteIds = userId
      ? await this.userRepository
          .createQueryBuilder('user')
          .leftJoinAndSelect('user.favoriteRecipes', 'recipe')
          .where('user.id = :id', { id: userId })
          .getOne()
          .then(user => user?.favoriteRecipes?.map(r => r.id) ?? [])
      : [];

    return plainToInstance(Recipe, recipes.map(recipe => ({
      ...recipe,
      isFavorite: favoriteIds.includes(recipe.id),
    })));
  }

  async findOne(id: number, user?: User): Promise<Recipe> {
    const recipe = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.category', 'category')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
      .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('recipe.ratings', 'ratings')
      .where('recipe.id = :id', { id })
      .andWhere(
        user
          ? '(recipe.userId = :userId OR recipe.is_public = true)'
          : 'recipe.is_public = true',
        user ? { userId: user.id } : {}
      )
      .getOne();

    if (!recipe) {
      throw new NotFoundException(`Recipe with ID ${id} not found or not accessible`);
    }

    recipe.commentsCount = recipe.comments?.length || 0;
    const totalRating = recipe.ratings?.reduce((sum, r) => sum + (r.value || 0), 0) || 0;
    recipe.avgRating = recipe.ratings?.length ? totalRating / recipe.ratings.length : 0;

    return recipe;
  }

  async findOneForEdit(id: number, user: User): Promise<Recipe> {
    const recipe = await this.recipeRepository
      .createQueryBuilder('recipe')
      .leftJoinAndSelect('recipe.category', 'category')
      .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
      .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')
      .leftJoinAndSelect('recipe.user', 'user')
      .leftJoinAndSelect('recipe.comments', 'comments')
      .leftJoinAndSelect('comments.user', 'commentUser')
      .leftJoinAndSelect('recipe.ratings', 'ratings')
      .where('recipe.id = :id', { id })
      .andWhere('recipe.userId = :userId', { userId: user.id })
      .getOne();

    if (!recipe) {
      throw new NotFoundException(`Recipe not found or not owned by user`);
    }

    recipe.commentsCount = recipe.comments?.length || 0;
    const totalRating = recipe.ratings?.reduce((sum, r) => sum + (r.value || 0), 0) || 0;
    recipe.avgRating = recipe.ratings?.length ? totalRating / recipe.ratings.length : 0;

    return recipe;
  }

  async update(
    id: number,
    dto: UpdateRecipeDto,
    user: User,
    imagePath: string | null,
  ): Promise<Recipe> {
    const recipe = await this.findOne(id, user);

    Object.assign(recipe, {
      name: dto.name ?? recipe.name,
      description: dto.description ?? recipe.description,
      instructions: dto.instructions ?? recipe.instructions,
      difficulty: dto.difficulty ?? recipe.difficulty,
      cooking_time: dto.cooking_time ?? recipe.cooking_time,
      is_public: dto.is_public ?? recipe.is_public,
    });

    if (imagePath) {
      recipe.imagePath = imagePath;
    }

    if (dto.categoryId && dto.categoryId !== recipe.category?.id) {
      const category = await this.categoryRepository.findOneBy({ id: dto.categoryId });
      if (!category) throw new NotFoundException('Category not found');
      recipe.category = category;
    }

    await this.recipeRepository.save(recipe);

    if (dto.ingredients) {
      await this.recipeIngredientRepository.delete({ recipe: { id: recipe.id } });

      for (const ingredientInput of dto.ingredients) {
        const rawName = typeof ingredientInput === 'string'
          ? ingredientInput
          : ingredientInput.name;

        const normalizedName = pluralize.singular(rawName.trim().toLowerCase());

        let ingredient = await this.ingredientRepository.findOneBy({ name: normalizedName });
        if (!ingredient) {
          ingredient = this.ingredientRepository.create({ name: normalizedName });
          await this.ingredientRepository.save(ingredient);
        }

        const recipeIngredient = this.recipeIngredientRepository.create({
          recipe,
          ingredient,
          quantity: ingredientInput.quantity,
        });

        await this.recipeIngredientRepository.save(recipeIngredient);
      }
    }

    const fullRecipe = await this.recipeRepository.findOne({
      where: { id: recipe.id },
      relations: [
        'recipeIngredients',
        'recipeIngredients.ingredient',
        'category',
        'user',
        'comments',
        'comments.user',
        'ratings',
      ],
    });

    if (!fullRecipe) throw new NotFoundException('Recipe not found after saving');

    fullRecipe.commentsCount = fullRecipe.comments?.length || 0;
    const totalRating = fullRecipe.ratings?.reduce((sum, r) => sum + (r.value || 0), 0) || 0;
    fullRecipe.avgRating = fullRecipe.ratings?.length ? totalRating / fullRecipe.ratings.length : 0;

    return fullRecipe;
  }

  async remove(id: number, user: User): Promise<void> {
    const recipe = await this.findOne(id, user);
    await this.recipeRepository.remove(recipe);
  }

 async findMyRecipes(user: User, filters?: FindRecipesDto): Promise<Recipe[]> {
  const query = this.recipeRepository.createQueryBuilder('recipe')
    .leftJoinAndSelect('recipe.category', 'category')
    .leftJoinAndSelect('recipe.user', 'user')
    .leftJoinAndSelect('recipe.recipeIngredients', 'recipeIngredients')
    .leftJoinAndSelect('recipeIngredients.ingredient', 'ingredient')

    .loadRelationCountAndMap('recipe.commentsCount', 'recipe.comments')

    .addSelect(subQuery => {
      return subQuery
        .select('AVG(rating.value)', 'avgRating')
        .from('rating', 'rating')
        .where('rating.recipeId = recipe.id');
    }, 'recipe_avg_rating')

    .where('recipe.user_id = :user_id', { user_id: user.id });

    if (filters?.status) {
      if (filters.status === 'public') {
        query.andWhere('recipe.is_public = true');
      } else if (filters.status === 'private') {
        query.andWhere('recipe.is_public = false');
      }
    }

    if (filters?.searchTerm) {
      const term = `%${filters.searchTerm.toLowerCase()}%`;
      query.andWhere(
        `(LOWER(recipe.name) LIKE :term OR LOWER(ingredient.name) LIKE :term)`,
        { term }
      );
    }

    const results = await query.orderBy('recipe.created_at', 'DESC').getMany();

    return plainToInstance(
      Recipe,
      results.map(recipe => ({
        ...recipe,
        avgRating: (recipe as any).recipe_avg_rating ?? 0,
      }))
    );
  }
}


