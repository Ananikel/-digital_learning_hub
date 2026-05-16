import { PrismaService } from '../prisma/prisma.service';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        status: string;
        studentId: number;
        amount: number;
        method: string;
        reference: string | null;
        date: Date;
        dueDate: Date | null;
    }>;
    findAll(): Promise<{
        id: number;
        learnerName: string;
        amountPaid: number;
        method: string;
        statusKey: string;
        receipt: string | null;
        date: string;
    }[]>;
    findOne(id: number): Promise<({
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
        amount: number;
        method: string;
        reference: string | null;
        date: Date;
        dueDate: Date | null;
    }) | null>;
    update(id: number, data: any): Promise<{
        id: number;
        status: string;
        studentId: number;
        amount: number;
        method: string;
        reference: string | null;
        date: Date;
        dueDate: Date | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        status: string;
        studentId: number;
        amount: number;
        method: string;
        reference: string | null;
        date: Date;
        dueDate: Date | null;
    }>;
}
