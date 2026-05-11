import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  // Roles
  const roles = ['ADMIN', 'TEACHER', 'STUDENT', 'USER'];
  for (const roleName of roles) {
    await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const teacherRole = await prisma.role.findUnique({ where: { name: 'TEACHER' } });
  const studentRole = await prisma.role.findUnique({ where: { name: 'STUDENT' } });

  const hashedPassword = await bcrypt.hash('password123', 10);

  // Demo Admin
  await prisma.user.upsert({
    where: { email: 'admin@lms.local' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'admin@lms.local',
      passwordHash: hashedPassword,
      roleId: adminRole!.id,
    },
  });

  // Demo Teacher
  await prisma.user.upsert({
    where: { email: 'teacher@lms.local' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'teacher@lms.local',
      passwordHash: hashedPassword,
      roleId: teacherRole!.id,
    },
  });

  // Demo Student
  await prisma.user.upsert({
    where: { email: 'student@lms.local' },
    update: { passwordHash: hashedPassword },
    create: {
      email: 'student@lms.local',
      passwordHash: hashedPassword,
      roleId: studentRole!.id,
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
