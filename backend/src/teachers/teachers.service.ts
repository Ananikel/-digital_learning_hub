import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const teachers = await this.prisma.teacher.findMany({
      include: {
        user: true,
      },
    });

    return teachers.map(t => ({
      id: t.id,
      name: t.fullName,
      phone: t.phone,
      email: t.user.email,
      position: t.qualification || "Formateur",
      qualification: t.qualification || "Certifié",
      statusKey: "active",
      workload: 0,
      assigned: 0
    }));
  }

  async findOne(id: number) {
    return this.prisma.teacher.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async create(data: any) {
    // Check if user exists
    let user = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (!user) {
        const role = await this.prisma.role.upsert({
            where: { name: "TEACHER" },
            update: {},
            create: { name: "TEACHER" }
        });
        user = await this.prisma.user.create({
            data: {
                email: data.email || `teacher_${Date.now()}@lms.local`,
                passwordHash: "dummy",
                roleId: role.id
            }
        });
    }

    return this.prisma.teacher.create({
      data: {
        fullName: data.name || "Nouveau Enseignant",
        phone: data.phone,
        qualification: data.qualification || data.position,
        userId: user.id
      },
      include: { user: true }
    });
  }

  async update(id: number, data: any) {
    return this.prisma.teacher.update({
      where: { id },
      data: {
        fullName: data.name,
        phone: data.phone,
        qualification: data.qualification || data.position,
      },
      include: { user: true }
    });
  }

  async remove(id: number) {
    return this.prisma.teacher.delete({
      where: { id },
    });
  }
}
