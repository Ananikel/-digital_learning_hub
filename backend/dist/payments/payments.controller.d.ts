import { PaymentsService } from './payments.service';
import { Prisma } from '@prisma/client';
export declare class PaymentsController {
    private readonly paymentsService;
    constructor(paymentsService: PaymentsService);
    create(data: Prisma.PaymentCreateInput): Promise<{
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
    findOne(id: string): Promise<({
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
    update(id: string, data: Prisma.PaymentUpdateInput): Promise<{
        id: number;
        status: string;
        studentId: number;
        amount: number;
        method: string;
        reference: string | null;
        date: Date;
        dueDate: Date | null;
    }>;
    remove(id: string): Promise<{
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
