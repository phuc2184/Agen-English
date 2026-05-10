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

  console.log(`✅ Admin user created successfully: ${admin.username}`);

  // Dummy users for leaderboard
  const dummyUsers = [
    { username: 'alex_learning', xp: 4500, level: 5 },
    { username: 'maria_eng', xp: 3200, level: 4 },
    { username: 'john_doe', xp: 1500, level: 2 },
    { username: 'sarah_smith', xp: 800, level: 1 },
    { username: 'viet_anh', xp: 5600, level: 6 },
  ];

  for (const u of dummyUsers) {
    const hash = await bcrypt.hash('password123', salt);
    await prisma.user.create({
      data: {
        email: `${u.username}@example.com`,
        username: u.username,
        password_hash: hash,
        total_xp: u.xp,
        current_level: u.level,
        streak_count: Math.floor(Math.random() * 10),
      },
    });
  }
  console.log('✅ Dummy users added to leaderboard.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
