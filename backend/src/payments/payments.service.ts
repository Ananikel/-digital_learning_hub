import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentsService {
  constructor(private prisma: PrismaService) {}

  create(data: Prisma.PaymentCreateInput) {
    return this.prisma.payment.create({ data });
  }

  findAll() {
    return this.prisma.payment.findMany({
      include: {
        student: true,
      },
    });
  }

  findOne(id: number) {
    return this.prisma.payment.findUnique({
      where: { id },
      include: {
        student: true,
      },
    });
  }

  update(id: number, data: Prisma.PaymentUpdateInput) {
    return this.prisma.payment.update({
      where: { id },
      data,
    });
  }

  remove(id: number) {
    return this.prisma.payment.delete({
      where: { id },
    });
  }
}
