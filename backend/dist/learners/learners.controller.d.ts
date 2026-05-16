import { LearnersService } from './learners.service';
import { Prisma } from '@prisma/client';
export declare class LearnersController {
    private readonly learnersService;
    constructor(learnersService: LearnersService);
    create(data: Prisma.StudentCreateInput): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
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
    findOne(id: string): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    } | null>;
    update(id: string, data: Prisma.StudentUpdateInput): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
    remove(id: string): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
}
