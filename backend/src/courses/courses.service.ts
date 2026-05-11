import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.CourseCreateInput) {
    return this.prisma.course.create({ data });
  }

  findAll() {
    return this.prisma.course.findMany({
      include: {
        cohort: true,
        teacher: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        cohort: true,
        teacher: true,
        attendance: true,
        assessments: true,
      },
    });
  }

  update(id: number, data: Prisma.CourseUpdateInput) {
    return this.prisma.course.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
