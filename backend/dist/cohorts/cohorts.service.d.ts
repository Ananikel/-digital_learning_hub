import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
export declare class CohortsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(data: Prisma.CohortCreateInput): Prisma.Prisma__CohortClient<{
        id: number;
        status: string;
        name: string;
        subjectId: number;
        schedule: string | null;
        capacity: number;
        levelId: number;
        teacherId: number;
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
            duration: string | null;
            baseFee: number;
            subjectId: number;
        };
    } & {
        id: number;
        status: string;
        name: string;
        subjectId: number;
        schedule: string | null;
        capacity: number;
        levelId: number;
        teacherId: number;
    })[]>;
    findOne(id: number): Prisma.Prisma__CohortClient<({
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
            duration: string | null;
            baseFee: number;
            subjectId: number;
        };
        enrollments: {
            id: number;
            enrollmentDate: Date;
            status: string;
            studentId: number;
            cohortId: number;
        }[];
    } & {
        id: number;
        status: string;
        name: string;
        subjectId: number;
        schedule: string | null;
        capacity: number;
        levelId: number;
        teacherId: number;
    }) | null, null, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    update(id: number, data: Prisma.CohortUpdateInput): Prisma.Prisma__CohortClient<{
        id: number;
        status: string;
        name: string;
        subjectId: number;
        schedule: string | null;
        capacity: number;
        levelId: number;
        teacherId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
    remove(id: number): Prisma.Prisma__CohortClient<{
        id: number;
        status: string;
        name: string;
        subjectId: number;
        schedule: string | null;
        capacity: number;
        levelId: number;
        teacherId: number;
    }, never, import("@prisma/client/runtime/client").DefaultArgs, Prisma.PrismaClientOptions>;
}
