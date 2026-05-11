import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CohortsService } from './cohorts.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cohorts')
@UseGuards(JwtAuthGuard)
export class CohortsController {
  constructor(private readonly cohortsService: CohortsService) {}

  @Post()
  create(@Body() data: Prisma.CohortCreateInput) {
    return this.cohortsService.create(data);
  }

  @Get()
  findAll() {
    return this.cohortsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cohortsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: Prisma.CohortUpdateInput) {
    return this.cohortsService.update(+id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cohortsService.remove(+id);
  }
}
