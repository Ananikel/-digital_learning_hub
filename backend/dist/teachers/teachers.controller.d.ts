import { TeachersService } from './teachers.service';
import { Prisma } from '@prisma/client';
export declare class TeachersController {
    private readonly teachersService;
    constructor(teachersService: TeachersService);
    create(data: Prisma.TeacherCreateInput): Promise<{
        user: {
            id: number;
            email: string;
            passwordHash: string;
            roleId: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        userId: number;
        fullName: string;
        phone: string | null;
        qualification: string | null;
        availability: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        name: string;
        phone: string | null;
        email: string;
        position: string;
        qualification: string;
        statusKey: string;
        workload: number;
        assigned: number;
    }[]>;
    findOne(id: string): Promise<({
        user: {
            id: number;
            email: string;
            passwordHash: string;
            roleId: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        userId: number;
        fullName: string;
        phone: string | null;
        qualification: string | null;
        availability: string | null;
    }) | null>;
    update(id: string, data: Prisma.TeacherUpdateInput): Promise<{
        user: {
            id: number;
            email: string;
            passwordHash: string;
            roleId: number;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        userId: number;
        fullName: string;
        phone: string | null;
        qualification: string | null;
        availability: string | null;
    }>;
    remove(id: string): Promise<{
        id: number;
        userId: number;
        fullName: string;
        phone: string | null;
        qualification: string | null;
        availability: string | null;
    }>;
}
