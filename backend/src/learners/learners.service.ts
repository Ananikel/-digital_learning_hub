import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class LearnersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.student.findMany({
      include: {
        user: true,
        enrollments: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        enrollments: true,
      },
    });
  }

  async create(data: Prisma.StudentCreateInput) {
    return this.prisma.student.create({
      data,
    });
  }

  async update(id: number, data: Prisma.StudentUpdateInput) {
    return this.prisma.student.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
