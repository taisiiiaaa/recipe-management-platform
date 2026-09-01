import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { Comment } from '../../comments/entities/comment.entity';
import { Rating } from '../../ratings/entities/rating.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  username: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ name: 'password_hash', nullable: true })
  passwordHash: string;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => Recipe, (recipe) => recipe.user)
  recipes: Recipe[];

  @ManyToMany(() => Recipe, (recipe) => recipe.favoritedBy)
  @JoinTable({
    name: 'user_favorites',
    joinColumn: { name: 'user_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'recipe_id', referencedColumnName: 'id' },
  })
  favoriteRecipes: Recipe[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments: Comment[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];
}
