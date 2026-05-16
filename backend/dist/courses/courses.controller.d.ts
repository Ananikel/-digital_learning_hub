import { CoursesService } from './courses.service';
import { Prisma } from '@prisma/client';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(data: Prisma.CourseCreateInput): Promise<{
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
    findOne(id: string): Promise<({
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
    update(id: string, data: Prisma.CourseUpdateInput): Promise<{
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
    remove(id: string): Promise<{
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
