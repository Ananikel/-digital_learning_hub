import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LearnersService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    const students = await this.prisma.student.findMany({
      include: {
        enrollments: {
          include: {
            cohort: {
              include: {
                subject: true
              }
            }
          }
        }
      },
    });
    
    return students.map(student => ({
      id: student.id,
      name: student.fullName,
      phone: student.phone,
      statusKey: student.status,
      subjectKey: student.enrollments[0]?.cohort.subject.code.toLowerCase() || "german",
      level: student.enrollments[0]?.cohort.levelId ? "A1" : "A1",
      progress: 0,
      attendance: 100,
      paid: 0,
      balance: 0
    }));
  }

  async findOne(id: number) {
    return this.prisma.student.findUnique({
      where: { id },
    });
  }

  async create(data: any) {
    return this.prisma.student.create({
      data: {
        fullName: data.name || "Nouveau Apprenant",
        phone: data.phone,
        status: data.statusKey || "active",
      },
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.fullName = data.name;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.statusKey !== undefined) updateData.status = data.statusKey;
    
    return this.prisma.student.update({
      where: { id },
      data: updateData,
    });
  }

  async remove(id: number) {
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
