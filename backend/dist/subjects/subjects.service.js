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
exports.SubjectsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let SubjectsService = class SubjectsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        const subjects = await this.prisma.subject.findMany({
            include: {
                levels: true
            }
        });
        return subjects.map(s => ({
            id: s.id,
            subjectKey: s.code.toLowerCase(),
            nameFr: s.nameFr,
            nameEn: s.nameEn,
            code: s.code,
            categoryKey: s.category,
            color: s.color || "cyan",
            description: s.description || "",
            levels: s.levels.map(l => l.name),
            duration: s.levels[0]?.duration || "3 mois",
            baseFee: s.levels[0]?.baseFee || 0,
            statusKey: "subjectStatusActive"
        }));
    }
    async findOne(id) {
        return this.prisma.subject.findUnique({
            where: { id },
            include: { levels: true }
        });
    }
    async create(data) {
        return this.prisma.subject.create({
            data: {
                nameFr: data.nameFr,
                nameEn: data.nameEn,
                code: data.code,
                category: data.categoryKey,
                color: data.color,
                description: data.description,
                levels: {
                    create: (data.levels || []).map((levelName) => ({
                        name: levelName,
                        duration: data.duration,
                        baseFee: data.baseFee
                    }))
                }
            },
            include: { levels: true }
        });
    }
    async update(id, data) {
        const updateData = {};
        if (data.nameFr !== undefined)
            updateData.nameFr = data.nameFr;
        if (data.nameEn !== undefined)
            updateData.nameEn = data.nameEn;
        if (data.code !== undefined)
            updateData.code = data.code;
        if (data.categoryKey !== undefined)
            updateData.category = data.categoryKey;
        if (data.color !== undefined)
            updateData.color = data.color;
        if (data.description !== undefined)
            updateData.description = data.description;
        if (data.levels !== undefined) {
            await this.prisma.level.deleteMany({ where: { subjectId: id } });
            updateData.levels = {
                create: (data.levels || []).map((levelName) => ({
                    name: levelName,
                    duration: data.duration,
                    baseFee: data.baseFee
                }))
            };
        }
        return this.prisma.subject.update({
            where: { id },
            data: updateData,
            include: { levels: true }
        });
    }
    async remove(id) {
        await this.prisma.level.deleteMany({ where: { subjectId: id } });
        return this.prisma.subject.delete({
            where: { id },
        });
    }
};
exports.SubjectsService = SubjectsService;
exports.SubjectsService = SubjectsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubjectsService);
//# sourceMappingURL=subjects.service.js.map