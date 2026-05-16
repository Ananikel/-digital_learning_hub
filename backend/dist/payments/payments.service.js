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
exports.PaymentsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PaymentsService = class PaymentsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(data) {
        let student = await this.prisma.student.findFirst({
            where: { fullName: data.learnerName }
        });
        if (!student) {
            student = await this.prisma.student.create({
                data: { fullName: data.learnerName || "Inconnu" }
            });
        }
        return this.prisma.payment.create({
            data: {
                amount: Number(data.amountPaid) || 0,
                method: data.method || "CASH",
                status: data.statusKey || "received",
                reference: data.receipt,
                studentId: student.id,
            }
        });
    }
    async findAll() {
        const payments = await this.prisma.payment.findMany({
            include: {
                student: true,
            },
        });
        return payments.map(p => ({
            id: p.id,
            learnerName: p.student.fullName,
            amountPaid: p.amount,
            method: p.method,
            statusKey: p.status,
            receipt: p.reference,
            date: p.date.toISOString().split('T')[0]
        }));
    }
    async findOne(id) {
        return this.prisma.payment.findUnique({
            where: { id },
            include: {
                student: true,
            },
        });
    }
    async update(id, data) {
        return this.prisma.payment.update({
            where: { id },
            data: {
                amount: Number(data.amountPaid),
                method: data.method,
                status: data.statusKey,
                reference: data.receipt,
            },
        });
    }
    async remove(id) {
        return this.prisma.payment.delete({
            where: { id },
        });
    }
};
exports.PaymentsService = PaymentsService;
exports.PaymentsService = PaymentsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PaymentsService);
//# sourceMappingURL=payments.service.js.map