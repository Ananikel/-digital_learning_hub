import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.PaymentCreateInput): Prisma.Prisma__PaymentClient<{
        id: number;
        status: string;
        studentId: number;
        date: Date;
        amount: number;
        method: string;
        reference: string | null;
        dueDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<({
        student: {
            id: number;
            userId: number | null;
            fullName: string;
            phone: string | null;
            enrollmentDate: Date;
            status: string;
        };
    } & {
        id: number;
        status: string;
        studentId: number;
        date: Date;
        amount: number;
        method: string;
        reference: string | null;
        dueDate: Date | null;
    })[]>;
    findOne(id: number): Prisma.Prisma__PaymentClient<({
        student: {
            id: number;
            userId: number | null;
            fullName: string;
            phone: string | null;
            enrollmentDate: Date;
            status: string;
        };
    } & {
        id: number;
        status: string;
        studentId: number;
        date: Date;
        amount: number;
        method: string;
        reference: string | null;
        dueDate: Date | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: number, data: Prisma.PaymentUpdateInput): Prisma.Prisma__PaymentClient<{
        id: number;
        status: string;
        studentId: number;
        date: Date;
        amount: number;
        method: string;
        reference: string | null;
        dueDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    remove(id: number): Prisma.Prisma__PaymentClient<{
        id: number;
        status: string;
        studentId: number;
        date: Date;
        amount: number;
        method: string;
        reference: string | null;
        dueDate: Date | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
}
