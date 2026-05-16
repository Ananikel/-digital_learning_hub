import { PrismaService } from '../prisma/prisma.service';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: any): Promise<{
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        week: number | null;
        title: string;
        session: number | null;
        type: string | null;
        objective: string | null;
    }>;
    findAll(): Promise<{
        id: number;
        title: string;
        cohortNameKey: string;
        subjectKey: string;
        teacher: string;
        week: number | null;
        session: number | null;
        typeKey: string | null;
        objective: string | null;
        progress: number;
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
        cohort: {
            id: number;
            status: string;
            name: string;
            subjectId: number;
            levelId: number;
            teacherId: number;
            schedule: string | null;
            capacity: number;
        };
    } & {
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        week: number | null;
        title: string;
        session: number | null;
        type: string | null;
        objective: string | null;
    }) | null>;
    update(id: number, data: any): Promise<{
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        week: number | null;
        title: string;
        session: number | null;
        type: string | null;
        objective: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        week: number | null;
        title: string;
        session: number | null;
        type: string | null;
        objective: string | null;
    }>;
}
