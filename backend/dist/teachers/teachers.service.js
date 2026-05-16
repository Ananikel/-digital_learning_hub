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
exports.TeachersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let TeachersService = class TeachersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const teachers = await this.prisma.teacher.findMany({
            include: {
                user: true,
            },
        });
        return teachers.map(t => ({
            id: t.id,
            name: t.fullName,
            phone: t.phone,
            email: t.user.email,
            position: t.qualification || "Formateur",
            qualification: t.qualification || "Certifié",
            statusKey: "active",
            workload: 0,
            assigned: 0
        }));
    }
    async findOne(id) {
        return this.prisma.teacher.findUnique({
            where: { id },
            include: {
                user: true,
            },
        });
    }
    async create(data) {
        let user = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (!user) {
            const role = await this.prisma.role.upsert({
                where: { name: "TEACHER" },
                update: {},
                create: { name: "TEACHER" }
            });
            user = await this.prisma.user.create({
                data: {
                    email: data.email || `teacher_${Date.now()}@lms.local`,
                    passwordHash: "dummy",
                    roleId: role.id
                }
            });
        }
        return this.prisma.teacher.create({
            data: {
                fullName: data.name || "Nouveau Enseignant",
                phone: data.phone,
                qualification: data.qualification || data.position,
                userId: user.id
            },
            include: { user: true }
        });
    }
    async update(id, data) {
        return this.prisma.teacher.update({
            where: { id },
            data: {
                fullName: data.name,
                phone: data.phone,
                qualification: data.qualification || data.position,
            },
            include: { user: true }
        });
    }
    async remove(id) {
        return this.prisma.teacher.delete({
            where: { id },
        });
    }
};
exports.TeachersService = TeachersService;
exports.TeachersService = TeachersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], TeachersService);
//# sourceMappingURL=teachers.service.js.map