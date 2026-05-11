import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CohortsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.CohortCreateInput) {
    return this.prisma.cohort.create({ data });
  }

  findAll() {
    return this.prisma.cohort.findMany({
      include: {
        subject: true,
        level: true,
        teacher: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.cohort.findUnique({
      where: { id },
      include: {
        subject: true,
        level: true,
        teacher: true,
        enrollments: true,
      },
    });
  }

  update(id: number, data: Prisma.CohortUpdateInput) {
    return this.prisma.cohort.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.cohort.delete({
      where: { id },
    });
  }
}
