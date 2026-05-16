import { PrismaService } from '../prisma/prisma.service';
export declare class CohortsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        teacher: {
            id: number;
            userId: number;
            fullName: string;
            phone: string | null;
            qualification: string | null;
            availability: string | null;
        };
        subject: {
            id: number;
            nameFr: string;
            nameEn: string;
            code: string;
            category: string;
            color: string | null;
            description: string | null;
        };
        level: {
            id: number;
            name: string;
            subjectId: number;
            duration: string | null;
            baseFee: number;
        };
    } & {
        id: number;
        status: string;
        name: string;
        subjectId: number;
        levelId: number;
        teacherId: number;
        schedule: string | null;
        capacity: number;
    }>;
    findAll(): Promise<{
        id: number;
        nameKey: string;
        subjectKey: string;
        level: string;
        students: number;
        capacity: number;
        teacher: string;
        schedule: string | null;
        progress: number;
        statusKey: string;
        gradient: string;
    }[]>;
    findOne(id: number): Promise<({
        teacher: {
            id: number;
            userId: number;
            fullName: string;
            phone: string | null;
            qualification: string | null;
            availability: string | null;
        };
        subject: {
            id: number;
            nameFr: string;
            nameEn: string;
            code: string;
            category: string;
            color: string | null;
            description: string | null;
        };
        level: {
            id: number;
            name: string;
            subjectId: number;
            duration: string | null;
            baseFee: number;
        };
    } & {
        id: number;
        status: string;
        name: string;
        subjectId: number;
        levelId: number;
        teacherId: number;
        schedule: string | null;
        capacity: number;
    }) | null>;
    update(id: number, data: any): Promise<{
        teacher: {
            id: number;
            userId: number;
            fullName: string;
            phone: string | null;
            qualification: string | null;
            availability: string | null;
        };
        subject: {
            id: number;
            nameFr: string;
            nameEn: string;
            code: string;
            category: string;
            color: string | null;
            description: string | null;
        };
        level: {
            id: number;
            name: string;
            subjectId: number;
            duration: string | null;
            baseFee: number;
        };
    } & {
        id: number;
        status: string;
        name: string;
        subjectId: number;
        levelId: number;
        teacherId: number;
        schedule: string | null;
        capacity: number;
    }>;
    remove(id: number): Promise<{
        id: number;
        status: string;
        name: string;
        subjectId: number;
        levelId: number;
        teacherId: number;
        schedule: string | null;
        capacity: number;
    }>;
}
