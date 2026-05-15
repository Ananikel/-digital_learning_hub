import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CohortsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Attempt to find or create relations
    let subject = await this.prisma.subject.findFirst({ where: { code: data.subjectKey.toUpperCase() } });
    if (!subject) {
      subject = await this.prisma.subject.create({
        data: {
          nameFr: data.subjectKey,
          nameEn: data.subjectKey,
          code: data.subjectKey.toUpperCase(),
          category: "general"
        }
      });
    }

    let level = await this.prisma.level.findFirst({ where: { subjectId: subject.id, name: data.level } });
    if (!level) {
      level = await this.prisma.level.create({
        data: {
          name: data.level,
          subjectId: subject.id
        }
      });
    }

    let teacher = await this.prisma.teacher.findFirst();
    if (!teacher) {
        // Create a dummy teacher if none exists to avoid 500
        const user = await this.prisma.user.findFirst() || await this.prisma.user.create({
            data: {
                email: "system@lms.local",
                passwordHash: "dummy",
                role: { create: { name: "system" } }
            }
        });
        teacher = await this.prisma.teacher.create({
            data: {
                fullName: "System Teacher",
                userId: user.id
            }
        });
    }

    return this.prisma.cohort.create({
      data: {
        name: data.nameKey || "Nouvelle Cohorte",
        subjectId: subject.id,
        levelId: level.id,
        teacherId: teacher.id,
        schedule: data.schedule,
        capacity: data.capacity,
        status: data.statusKey || "planned"
      },
      include: {
        subject: true,
        level: true,
        teacher: true
      }
    });
  }

  async findAll() {
    const cohorts = await this.prisma.cohort.findMany({
      include: {
        subject: true,
        level: true,
        teacher: true,
      },
    });

    return cohorts.map(c => ({
        id: c.id,
        nameKey: c.name,
        subjectKey: c.subject.code.toLowerCase(),
        level: c.level.name,
        students: 0,
        capacity: c.capacity,
        teacher: c.teacher.fullName,
        schedule: c.schedule,
        progress: 0,
        statusKey: c.status,
        gradient: "from-cyan-400 to-sky-600"
    }));
  }

  async findOne(id: number) {
    return this.prisma.cohort.findUnique({
      where: { id },
      include: {
        subject: true,
        level: true,
        teacher: true,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.cohort.update({
      where: { id },
      data: {
        name: data.nameKey,
        schedule: data.schedule,
        capacity: data.capacity,
        status: data.statusKey
      },
      include: {
        subject: true,
        level: true,
        teacher: true
      }
    });
  }

  async remove(id: number) {
    return this.prisma.cohort.delete({
      where: { id },
    });
  }
}
