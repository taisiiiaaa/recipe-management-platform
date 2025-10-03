import { Controller, Post, Param, Body, UseGuards, Get, BadRequestException } from '@nestjs/common';
import { RatingsService } from './ratings.service';
import { CreateRatingDto } from './dto/create-rating.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User as UserEntity } from '../users/entities/user.entity';
import { UserDecorator } from '../common/decorators/user.decorator';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('ratings')
@ApiBearerAuth('access-token')
@Controller('recipes/:recipeId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Rate a recipe' })
  @ApiResponse({ status: 201, description: 'Rating created successfully' })
  @ApiResponse({ status: 409, description: 'User has already rated this recipe' })
  async create(
    @Param('recipeId') recipeId: string,
    @UserDecorator() user: UserEntity,
    @Body() createRatingDto: CreateRatingDto,
  ) {
    const id = Number(recipeId);
    if (isNaN(id)) throw new BadRequestException('Invalid recipe ID');
    
    return this.ratingsService.create(id, user, createRatingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get average rating for a recipe' })
  @ApiResponse({ status: 200, description: 'Average rating retrieved successfully' })
  async getAverage(@Param('recipeId') recipeId: number) {
    return this.ratingsService.getAverageRating(recipeId);
  }
}
