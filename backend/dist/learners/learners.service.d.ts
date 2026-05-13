import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class LearnersService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        user: {
            id: number;
            email: string;
            passwordHash: string;
            roleId: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        enrollments: {
            id: number;
            enrollmentDate: Date;
            status: string;
            studentId: number;
            cohortId: number;
        }[];
    } & {
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    })[]>;
    findOne(id: number): Promise<({
        user: {
            id: number;
            email: string;
            passwordHash: string;
            roleId: number;
            createdAt: Date;
            updatedAt: Date;
        } | null;
        enrollments: {
            id: number;
            enrollmentDate: Date;
            status: string;
            studentId: number;
            cohortId: number;
        }[];
    } & {
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }) | null>;
    create(data: Prisma.StudentCreateInput): Promise<{
        id: number;
        userId: number | null;
        fullName: string;
        phone: string | null;
        enrollmentDate: Date;
        status: string;
    }>;
    update(id: number, data: Prisma.StudentUpdateInput): Promise<{
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
