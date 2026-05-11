import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.subject.findMany({
      include: {
        levels: true,
      },
    });
  }

  async findOne(id: number) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: {
        levels: true,
      },
    });
  }

  async create(data: Prisma.SubjectCreateInput) {
    return this.prisma.subject.create({
      data,
    });
  }

  async update(id: number, data: Prisma.SubjectUpdateInput) {
    return this.prisma.subject.update({
      where: { id },
      data,
    });
  }

  async remove(id: number) {
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
