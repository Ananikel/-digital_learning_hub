import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        levels: {
            id: number;
            name: string;
            duration: string | null;
            baseFee: number;
            subjectId: number;
        }[];
    } & {
        id: number;
        description: string | null;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
    })[]>;
    findOne(id: number): Promise<({
        levels: {
            id: number;
            name: string;
            duration: string | null;
            baseFee: number;
            subjectId: number;
        }[];
    } & {
        id: number;
        description: string | null;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
    }) | null>;
    create(data: Prisma.SubjectCreateInput): Promise<{
        id: number;
        description: string | null;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
    }>;
    update(id: number, data: Prisma.SubjectUpdateInput): Promise<{
        id: number;
        description: string | null;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        description: string | null;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
    }>;
}
