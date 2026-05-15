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
            cohort: true
          }
        }
      },
    });
    
    // Map backend Student to frontend Learner
    return students.map(student => ({
      id: student.id,
      name: student.fullName,
      phone: student.phone,
      statusKey: student.status,
      // Default mappings for fields not yet in DB
      subjectKey: "german",
      level: "A1",
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
    // Flattened data from frontend
    return this.prisma.student.create({
      data: {
        fullName: data.name || "Nouveau Apprenant",
        phone: data.phone,
        status: data.statusKey || "active",
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.student.update({
      where: { id },
      data: {
        fullName: data.name,
        phone: data.phone,
        status: data.statusKey,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.student.delete({
      where: { id },
    });
  }
}
