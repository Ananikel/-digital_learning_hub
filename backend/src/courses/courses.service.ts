import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Frontend sends: title, week, session, objective, typeKey, subjectKey, cohortNameKey, teacher
    
    let cohort = await this.prisma.cohort.findFirst({
        where: { name: data.cohortNameKey }
    });

    if (!cohort) {
        // Find by subject code as fallback
        const subject = await this.prisma.subject.findFirst({
            where: { code: (data.subjectKey || "GERMAN").toUpperCase() }
        });
        cohort = await this.prisma.cohort.findFirst({
            where: { subjectId: subject?.id }
        }) || await this.prisma.cohort.findFirst();
    }

    let teacher = await this.prisma.teacher.findFirst({
        where: { fullName: data.teacher }
    }) || await this.prisma.teacher.findFirst();

    if (!cohort || !teacher) {
        throw new Error("Cohort or Teacher not found for course creation");
    }

    return this.prisma.course.create({
      data: {
        title: data.title || "Nouveau cours",
        cohortId: cohort.id,
        teacherId: teacher.id,
        week: Number(data.week) || 1,
        session: Number(data.session) || 1,
        type: data.typeKey || "workshop",
        objective: data.objective,
        status: "draft"
      }
    });
  }

  async findAll() {
    const courses = await this.prisma.course.findMany({
      include: {
        cohort: { include: { subject: true } },
        teacher: true,
      },
    });

    return courses.map(c => ({
        id: c.id,
        title: c.title,
        cohortNameKey: c.cohort.name,
        subjectKey: c.cohort.subject.code.toLowerCase(),
        teacher: c.teacher.fullName,
        week: c.week,
        session: c.session,
        typeKey: c.type,
        objective: c.objective,
        progress: 0
    }));
  }

  async findOne(id: number) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        cohort: true,
        teacher: true,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        week: Number(data.week),
        session: Number(data.session),
        type: data.typeKey,
        objective: data.objective,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.course.delete({
      where: { id },
    });
  }
}
