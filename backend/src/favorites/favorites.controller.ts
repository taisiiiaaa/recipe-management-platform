import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDecorator } from '../common/decorators/user.decorator'; 
import { User } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('favorites')
@ApiBearerAuth('access-token')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Post(':recipeId')
  addFavorite(@Param('recipeId') recipeId: number, @UserDecorator() user: User) {
    const id = Number(recipeId);
    return this.favoritesService.addFavorite(user.id, id);
  }

  @Delete(':recipeId')
  removeFavorite(@Param('recipeId') recipeId: number, @UserDecorator() user: User) {
    const id = Number(recipeId);
    return this.favoritesService.removeFavorite(user.id, recipeId);
  }

  @Get()
  getFavorites(@UserDecorator() user: User) {
    return this.favoritesService.getFavorites(user.id);
  }
}
