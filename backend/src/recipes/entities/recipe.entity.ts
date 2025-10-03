import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany, ManyToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity'; 
import { RecipeIngredient } from '../../recipe-ingredients/entities/recipe-ingredient.entity'; 
import { Category } from 'src/categories/entities/categories.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Rating } from '../../ratings/entities/rating.entity';
import { Expose } from 'class-transformer';

@Entity('recipes')
export class Recipe {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({ nullable: true })
  name: string;
  @Column('text', { nullable: true })
  description?: string;
  @Column('text', { nullable: true })
  instructions: string;
  @Column({
    type: 'enum',
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Easy',
  })
  difficulty: 'Easy' | 'Medium' | 'Hard';
  @Column('int', { nullable: true })
  cooking_time: number;
  @ManyToOne(() => Category, (category) => category.recipes, { eager: true })
  @JoinColumn({ name: 'category_id' })
  category: Category;
  @Column({ default: true })
  is_public: boolean;
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: Date;
  @ManyToOne(() => User, (user) => user.recipes)
  @JoinColumn({ name: 'user_id' })
  user: User;
  @OneToMany(() => RecipeIngredient, (ri) => ri.recipe, { cascade: true })
  recipeIngredients: RecipeIngredient[];
  @Column({ nullable: true })
  imagePath?: string;
  @ManyToMany(() => User, (user) => user.favoriteRecipes)
  favoritedBy: User[];
  @OneToMany(() => Comment, (comment) => comment.recipe, { cascade: true })
  comments: Comment[];
  @OneToMany(() => Rating, rating => rating.recipe)
  ratings: Rating[];
  @Column({ name: 'user_id' })
  userId: number;
  @Expose()
  get ingredients(): { name: string; quantity: string | undefined }[] | undefined {
    return this.recipeIngredients?.map(ri => ({
      name: ri.ingredient.name,
      quantity: ri.quantity,
    }));
  }
  @Expose()
  avgRating?: number;
  @Expose()
  isFavorite?: boolean;
  @Expose()
  commentsCount?: number;
}


