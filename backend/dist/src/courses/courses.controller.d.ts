import { CoursesService } from './courses.service';
import { Prisma } from '@prisma/client';
export declare class CoursesController {
    private readonly coursesService;
    constructor(coursesService: CoursesService);
    create(data: Prisma.CourseCreateInput): Prisma.Prisma__CourseClient<{
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        title: string;
        type: string | null;
        week: number | null;
        session: number | null;
        objective: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    findAll(): Prisma.PrismaPromise<({
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
            name: string;
            status: string;
            subjectId: number;
            schedule: string | null;
            capacity: number;
            levelId: number;
            teacherId: number;
        };
    } & {
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        title: string;
        type: string | null;
        week: number | null;
        session: number | null;
        objective: string | null;
    })[]>;
    findOne(id: string): Prisma.Prisma__CourseClient<({
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
            name: string;
            status: string;
            subjectId: number;
            schedule: string | null;
            capacity: number;
            levelId: number;
            teacherId: number;
        };
        attendance: {
            id: number;
            status: string;
            studentId: number;
            courseId: number;
            date: Date;
            note: string | null;
        }[];
        assessments: {
            id: number;
            title: string;
            type: string;
            courseId: number;
            maxScore: number;
        }[];
    } & {
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        title: string;
        type: string | null;
        week: number | null;
        session: number | null;
        objective: string | null;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: string, data: Prisma.CourseUpdateInput): Prisma.Prisma__CourseClient<{
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        title: string;
        type: string | null;
        week: number | null;
        session: number | null;
        objective: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    remove(id: string): Prisma.Prisma__CourseClient<{
        id: number;
        status: string;
        cohortId: number;
        teacherId: number;
        title: string;
        type: string | null;
        week: number | null;
        session: number | null;
        objective: string | null;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
}
