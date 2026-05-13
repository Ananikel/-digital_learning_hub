import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class CoursesService {
    private prisma;
    constructor(prisma: PrismaService);
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
            status: string;
            name: string;
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
    findOne(id: number): Prisma.Prisma__CourseClient<({
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
    update(id: number, data: Prisma.CourseUpdateInput): Prisma.Prisma__CourseClient<{
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
    remove(id: number): Prisma.Prisma__CourseClient<{
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
