import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CohortsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    try {
      const subjectCode = (data.subjectKey || "GERMAN").toUpperCase();
      let subject = await this.prisma.subject.findUnique({ where: { code: subjectCode } });
      
      if (!subject) {
        subject = await this.prisma.subject.create({
          data: {
            nameFr: data.subjectKey || "Matière",
            nameEn: data.subjectKey || "Subject",
            code: subjectCode,
            category: "general"
          }
        });
      }

      let level = await this.prisma.level.findFirst({ 
        where: { subjectId: subject.id, name: data.level || "A1" } 
      });
      
      if (!level) {
        level = await this.prisma.level.create({
          data: {
            name: data.level || "A1",
            subjectId: subject.id
          }
        });
      }

      let teacher = await this.prisma.teacher.findFirst();
      if (!teacher) {
          let user = await this.prisma.user.findUnique({ where: { email: "system@lms.local" } });
          if (!user) {
              const role = await this.prisma.role.upsert({
                  where: { name: "ADMIN" },
                  update: {},
                  create: { name: "ADMIN", description: "System Administrator" }
              });
              user = await this.prisma.user.create({
                  data: {
                      email: "system@lms.local",
                      passwordHash: "dummy",
                      roleId: role.id
                  }
              });
          }
          teacher = await this.prisma.teacher.create({
              data: {
                  fullName: "System Teacher",
                  userId: user.id
              }
          });
      }

      return await this.prisma.cohort.create({
        data: {
          name: data.nameKey || "Nouvelle Cohorte",
          subjectId: subject.id,
          levelId: level.id,
          teacherId: teacher.id,
          schedule: data.schedule || "08:00 - 10:00",
          capacity: Number(data.capacity) || 20,
          status: data.statusKey || "planned"
        },
        include: {
          subject: true,
          level: true,
          teacher: true
        }
      });
    } catch (error) {
      console.error("Error in CohortsService.create:", error);
      throw error;
    }
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
    const updateData: any = {};
    if (data.nameKey !== undefined) updateData.name = data.nameKey;
    if (data.schedule !== undefined) updateData.schedule = data.schedule;
    if (data.capacity !== undefined) updateData.capacity = Number(data.capacity);
    if (data.statusKey !== undefined) updateData.status = data.statusKey;

    return this.prisma.cohort.update({
      where: { id },
      data: updateData,
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
