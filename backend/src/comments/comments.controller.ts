import {
  Controller,
  Post,
  Body,
  Param,
  UseGuards,
  Get,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UserDecorator } from '../common/decorators/user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('comments')
@ApiBearerAuth('access-token')
@Controller('recipes/:recipeId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Param('recipeId') recipeId: number,
    @UserDecorator() user: User,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.commentsService.create(recipeId, user, createCommentDto);
  }

  @Get()
  findAll(@Param('recipeId') recipeId: number) {
    return this.commentsService.findByRecipe(recipeId);
  }
}
