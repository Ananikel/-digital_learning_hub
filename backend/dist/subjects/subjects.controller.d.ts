import { SubjectsService } from './subjects.service';
import { Prisma } from '@prisma/client';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    create(data: Prisma.SubjectCreateInput): Promise<{
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
    findOne(id: string): Promise<({
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
    update(id: string, data: Prisma.SubjectUpdateInput): Promise<{
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
    remove(id: string): Promise<{
        id: number;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    }>;
}
