import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Unique, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';

@Entity()
@Unique(['user', 'recipe'])
export class Rating {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'float', nullable: false })
  value: number;

  @ManyToOne(() => User, user => user.ratings, { eager: true })
  user: User;

  @ManyToOne(() => Recipe, recipe => recipe.ratings, { onDelete: 'CASCADE' })
  recipe: Recipe;

  @CreateDateColumn()
  createdAt: Date;
}
