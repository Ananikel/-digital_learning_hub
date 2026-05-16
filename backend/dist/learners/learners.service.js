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
exports.LearnersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let LearnersService = class LearnersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const students = await this.prisma.student.findMany({
            include: {
                enrollments: {
                    include: {
                        cohort: {
                            include: {
                                subject: true
                            }
                        }
                    }
                }
            },
        });
        return students.map(student => ({
            id: student.id,
            name: student.fullName,
            phone: student.phone,
            statusKey: student.status,
            subjectKey: student.enrollments[0]?.cohort.subject.code.toLowerCase() || "german",
            level: student.enrollments[0]?.cohort.levelId ? "A1" : "A1",
            progress: 0,
            attendance: 100,
            paid: 0,
            balance: 0
        }));
    }
    async findOne(id) {
        return this.prisma.student.findUnique({
            where: { id },
        });
    }
    async create(data) {
        return this.prisma.student.create({
            data: {
                fullName: data.name || "Nouveau Apprenant",
                phone: data.phone,
                status: data.statusKey || "active",
            },
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.name !== undefined)
            updateData.fullName = data.name;
        if (data.phone !== undefined)
            updateData.phone = data.phone;
        if (data.statusKey !== undefined)
            updateData.status = data.statusKey;
        return this.prisma.student.update({
            where: { id },
            data: updateData,
        });
    }
    async remove(id) {
        return this.prisma.student.delete({
            where: { id },
        });
    }
};
exports.LearnersService = LearnersService;
exports.LearnersService = LearnersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], LearnersService);
//# sourceMappingURL=learners.service.js.map