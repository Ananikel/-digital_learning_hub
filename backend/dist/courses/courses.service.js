"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CoursesService = class CoursesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        let cohort = await this.prisma.cohort.findFirst({
            where: { name: data.cohortNameKey }
        });
        if (!cohort) {
            const subject = await this.prisma.subject.findFirst({
                where: { code: (data.subjectKey || "GERMAN").toUpperCase() }
            });
            cohort = await this.prisma.cohort.findFirst({
                where: { subjectId: subject?.id }
            }) || await this.prisma.cohort.findFirst();
        }
        let teacher = await this.prisma.teacher.findFirst({
            where: { fullName: data.teacher }
        }) || await this.prisma.teacher.findFirst();
        if (!cohort || !teacher) {
            throw new Error("Cohort or Teacher not found for course creation");
        }
        return this.prisma.course.create({
            data: {
                title: data.title || "Nouveau cours",
                cohortId: cohort.id,
                teacherId: teacher.id,
                week: Number(data.week) || 1,
                session: Number(data.session) || 1,
                type: data.typeKey || "workshop",
                objective: data.objective,
                status: "draft"
            }
        });
    }
    async findAll() {
        const courses = await this.prisma.course.findMany({
            include: {
                cohort: { include: { subject: true } },
                teacher: true,
            },
        });
        return courses.map(c => ({
            id: c.id,
            title: c.title,
            cohortNameKey: c.cohort.name,
            subjectKey: c.cohort.subject.code.toLowerCase(),
            teacher: c.teacher.fullName,
            week: c.week,
            session: c.session,
            typeKey: c.type,
            objective: c.objective,
            progress: 0
        }));
    }
    async findOne(id) {
        return this.prisma.course.findUnique({
            where: { id },
            include: {
                cohort: true,
                teacher: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.course.update({
            where: { id },
            data: {
                title: data.title,
                week: Number(data.week),
                session: Number(data.session),
                type: data.typeKey,
                objective: data.objective,
            },
        });
    }
    async remove(id) {
        return this.prisma.course.delete({
            where: { id },
        });
    }
};
exports.CoursesService = CoursesService;
exports.CoursesService = CoursesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CoursesService);
//# sourceMappingURL=courses.service.js.map