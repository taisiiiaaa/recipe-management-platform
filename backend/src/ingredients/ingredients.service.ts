import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Ingredient } from './entities/ingredient.entity';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import * as pluralize from 'pluralize';

@Injectable()
export class IngredientsService {
  constructor(
    @InjectRepository(Ingredient)
    private readonly ingredientRepository: Repository<Ingredient>,
  ) {}

  async create(dto: CreateIngredientDto) {
    let { name } = dto;

    name = pluralize.singular(name.trim().toLowerCase());

    const existing = await this.ingredientRepository.findOneBy({ name });
    if (existing) return existing;

    const ingredient = this.ingredientRepository.create({ name });
    return this.ingredientRepository.save(ingredient);
  }

  findAll() {
    return this.ingredientRepository.find();
  }

  async autocomplete(query: string): Promise<string[]> {
    if (!query || query.trim() === '') return [];

    const results = await this.ingredientRepository
      .createQueryBuilder('ingredient')
      .where('ingredient.name ILIKE :query', { query: `%${query}%` })
      .orderBy('ingredient.name', 'ASC')
      .limit(10)
      .getMany();

    return results.map((ingredient) => ingredient.name);
  }


  async delete(id: number) {
    await this.ingredientRepository.delete(id);
    return { deleted: true };
  }
}
