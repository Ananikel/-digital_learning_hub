import { PrismaService } from '../prisma/prisma.service';
export declare class SubjectsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<{
        id: number;
        subjectKey: string;
        nameFr: string;
        nameEn: string;
        code: string;
        categoryKey: string;
        color: string;
        description: string;
        levels: string[];
        duration: string;
        baseFee: number;
        statusKey: string;
    }[]>;
    findOne(id: number): Promise<({
        levels: {
            id: number;
            name: string;
            subjectId: number;
            duration: string | null;
            baseFee: number;
        }[];
    } & {
        id: number;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    }) | null>;
    create(data: any): Promise<{
        levels: {
            id: number;
            name: string;
            subjectId: number;
            duration: string | null;
            baseFee: number;
        }[];
    } & {
        id: number;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    }>;
    update(id: number, data: any): Promise<{
        levels: {
            id: number;
            name: string;
            subjectId: number;
            duration: string | null;
            baseFee: number;
        }[];
    } & {
        id: number;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    }>;
}
