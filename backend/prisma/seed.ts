import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    console.error('ERROR: ADMIN_USERNAME and ADMIN_PASSWORD must be set in .env');
    process.exit(1);
  }

  // Check if admin already exists
  const existing = await prisma.user.findUnique({
    where: { username: adminUsername },
  });

  if (existing) {
    console.log(`Admin user "${adminUsername}" already exists. Skipping seed.`);
    return;
  }

  const salt = await bcrypt.genSalt(12);
  const password_hash = await bcrypt.hash(adminPassword, salt);

  const admin = await prisma.user.create({
    data: {
      email: `${adminUsername}@agen-english.local`,
      username: adminUsername,
      password_hash,
      role: 'SUPER_ADMIN',
      is_unlimited: true,
      streak_count: 999,
      total_xp: 999999,
      current_level: 99,
    },
  });

  console.log(`✅ Admin user created successfully:`);
  console.log(`   Username : ${admin.username}`);
  console.log(`   Email    : ${admin.email}`);
  console.log(`   Role     : ${admin.role}`);
  console.log(`   Unlimited: ${admin.is_unlimited}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
