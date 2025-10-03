import { Controller, Post, Get, Body, Delete, Param, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { IngredientsService } from './ingredients.service';
import { CreateIngredientDto } from './dto/create-ingredient.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('ingredients')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('ingredients')
export class IngredientsController {
  constructor(private readonly service: IngredientsService) {}

  @Post()
  async create(@Body() dto: CreateIngredientDto) {
    return this.service.create(dto);
  }

  @Get('autocomplete')
  @ApiOperation({ summary: 'Autocomplete ingredient names' })
  async autocomplete(@Query('query') query: string): Promise<string[]> {
    return this.service.autocomplete(query);
  }

  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.service.delete(id);
  }
}
