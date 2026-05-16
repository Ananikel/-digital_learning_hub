import { PrismaService } from '../prisma/prisma.service';
export declare class TeachersService {
    private prisma;
    constructor(prisma: PrismaService);
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
    findOne(id: number): Promise<({
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
    create(data: any): Promise<{
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
    update(id: number, data: any): Promise<{
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
    remove(id: number): Promise<{
        id: number;
        userId: number;
        fullName: string;
        phone: string | null;
        qualification: string | null;
        availability: string | null;
    }>;
}
