import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private prisma: PrismaService) {}

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

  async findOne(id: number) {
    return this.prisma.subject.findUnique({
      where: { id },
      include: { levels: true }
    });
  }

  async create(data: any) {
    return this.prisma.subject.create({
      data: {
        nameFr: data.nameFr,
        nameEn: data.nameEn,
        code: data.code,
        category: data.categoryKey,
        color: data.color,
        description: data.description,
        levels: {
          create: (data.levels || []).map((levelName: string) => ({
            name: levelName,
            duration: data.duration,
            baseFee: data.baseFee
          }))
        }
      },
      include: { levels: true }
    });
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.nameFr !== undefined) updateData.nameFr = data.nameFr;
    if (data.nameEn !== undefined) updateData.nameEn = data.nameEn;
    if (data.code !== undefined) updateData.code = data.code;
    if (data.categoryKey !== undefined) updateData.category = data.categoryKey;
    if (data.color !== undefined) updateData.color = data.color;
    if (data.description !== undefined) updateData.description = data.description;

    if (data.levels !== undefined) {
      await this.prisma.level.deleteMany({ where: { subjectId: id } });
      updateData.levels = {
        create: (data.levels || []).map((levelName: string) => ({
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

  async remove(id: number) {
    await this.prisma.level.deleteMany({ where: { subjectId: id } });
    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
