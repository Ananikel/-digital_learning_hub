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
    findOne(id: string): Promise<({
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
