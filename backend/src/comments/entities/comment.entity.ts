import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Recipe } from '../../recipes/entities/recipe.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Comment {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;

    @ApiProperty()
    @Column()
    content: string;
    
    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.comments, { eager: true })
    user: User;

    @ManyToOne(() => Recipe, (recipe) => recipe.comments, { onDelete: 'CASCADE' })
    recipe: Recipe;
}
