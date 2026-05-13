import { SubjectsService } from './subjects.service';
import { Prisma } from '@prisma/client';
export declare class SubjectsController {
    private readonly subjectsService;
    constructor(subjectsService: SubjectsService);
    create(data: Prisma.SubjectCreateInput): Promise<{
        id: number;
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    }>;
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
        nameFr: string;
        nameEn: string;
        code: string;
        category: string;
        color: string | null;
        description: string | null;
    })[]>;
    findOne(id: string): Promise<({
        levels: {
            id: number;
            name: string;
            duration: string | null;
            baseFee: number;
            subjectId: number;
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
