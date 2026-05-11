import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { LearnersService } from './learners.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('learners')
@UseGuards(JwtAuthGuard)
export class LearnersController {
  constructor(private readonly learnersService: LearnersService) {}

  @Post()
  create(@Body() data: Prisma.StudentCreateInput) {
    return this.learnersService.create(data);
  }

  @Get()
  findAll() {
    return this.learnersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learnersService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.StudentUpdateInput) {
    return this.learnersService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learnersService.remove(+id);
  }
}
