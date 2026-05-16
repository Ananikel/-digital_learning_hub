import { PrismaService } from '../prisma/prisma.service';
export declare class LearnersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        name: string;
        phone: string | null;
        statusKey: string;
        subjectKey: string;
        level: string;
        progress: number;
        attendance: number;
        paid: number;
        balance: number;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    } | null>;
    create(data: any): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
    update(id: number, data: any): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
    remove(id: number): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
}
