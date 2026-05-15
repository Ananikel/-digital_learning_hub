import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    // Map frontend fields to backend
    // Frontend sends: totalFees, amountPaid, amountDue, receipt, learnerName, etc.
    // Backend expects: amount, method, status, reference, studentId
    
    let student = await this.prisma.student.findFirst({
        where: { fullName: data.learnerName }
    });

    if (!student) {
        student = await this.prisma.student.create({
            data: { fullName: data.learnerName || "Inconnu" }
        });
    }

    return this.prisma.payment.create({
      data: {
        amount: Number(data.amountPaid) || 0,
        method: data.method || "CASH",
        status: data.statusKey || "received",
        reference: data.receipt,
        studentId: student.id,
      }
    });
  }

  async findAll() {
    const payments = await this.prisma.payment.findMany({
      include: {
        student: true,
      },
    });

    return payments.map(p => ({
        id: p.id,
        learnerName: p.student.fullName,
        amountPaid: p.amount,
        method: p.method,
        statusKey: p.status,
        receipt: p.reference,
        date: p.date.toISOString().split('T')[0]
    }));
  }

  async findOne(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: true,
      },
    });
  }

  async update(id: number, data: any) {
    return this.prisma.payment.update({
      where: { id },
      data: {
        amount: Number(data.amountPaid),
        method: data.method,
        status: data.statusKey,
        reference: data.receipt,
      },
    });
  }

  async remove(id: number) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
