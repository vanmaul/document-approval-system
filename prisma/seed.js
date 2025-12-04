const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.activityLog.deleteMany();
  await prisma.submissionVersion.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.approvalStep.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.user.deleteMany();

  // Seed users with all 8 roles + admin + staff
  const users = [
    {
      email: "admin@example.com",
      password: "Admin123!",
      name: "Administrator",
      role: "ADMIN",
    },
    {
      email: "staff@example.com",
      password: "Staff123!",
      name: "Staff Member",
      role: "STAFF",
    },
    {
      email: "op.director@example.com",
      password: "OpDir123!",
      name: "Operational Director",
      role: "OPERATIONAL_DIRECTOR",
    },
    {
      email: "finance.director@example.com",
      password: "FinDir123!",
      name: "Finance Director",
      role: "FINANCE_DIRECTOR",
    },
    {
      email: "hrd@example.com",
      password: "Hrd123!",
      name: "HRD Manager",
      role: "HRD",
    },
    {
      email: "lovecore@example.com",
      password: "Lovecore123!",
      name: "Lovecore Manager",
      role: "LOVECORE",
    },
    {
      email: "abn@example.com",
      password: "Abn123!",
      name: "ABN Manager",
      role: "ABN",
    },
    {
      email: "purchasing@example.com",
      password: "Purch123!",
      name: "Purchasing Manager",
      role: "PURCHASING",
    },
    {
      email: "assistant.director@example.com",
      password: "Assist123!",
      name: "Director's Assistant",
      role: "DIRECTOR_ASSISTANT",
    },
  ];

  for (const user of users) {
    const hashedPassword = await bcrypt.hash(user.password, 10);

    await prisma.user.create({
      data: {
        email: user.email,
        password: hashedPassword,
        name: user.name,
        role: user.role,
        isActive: true,
      },
    });

    console.log(`✓ Created user: ${user.email} (${user.role})`);
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
