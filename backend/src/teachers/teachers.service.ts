import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.teacher.findMany({
      include: {
        user: true,
        cohorts: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
        cohorts: true,
      },
    });
  }

  async create(data: Prisma.TeacherCreateInput) {
    return this.prisma.teacher.create({
      data,
    });
  }

  async update(id: number, data: Prisma.TeacherUpdateInput) {
    return this.prisma.teacher.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}
