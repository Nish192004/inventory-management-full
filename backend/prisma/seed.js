import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

const main = async () => {
  // 1. Hash admin password
  const passwordHash = await bcrypt.hash("Admin12345", 12);

  // 2. Create admin if it doesn't exist
  await prisma.user.upsert({
    where: {
      email: "admin@example.com"
    },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@example.com",
      passwordHash,
      role: "ADMIN"
    }
  });

  // 3. Create/find Electronics category
  const electronics = await prisma.category.upsert({
    where: {
      name: "Electronics"
    },
    update: {},
    create: {
      name: "Electronics"
    }
  });

  // 4. Create/find Stationery category
  const stationery = await prisma.category.upsert({
    where: {
      name: "Stationery"
    },
    update: {},
    create: {
      name: "Stationery"
    }
  });

  // 5. Create sample products
  await prisma.product.createMany({
    data: [
      {
        name: "Wireless Mouse",
        sku: "WM-001",
        categoryId: electronics.id,
        quantity: 40,
        price: 799,
        minStock: 10
      },
      {
        name: "Keyboard",
        sku: "KB-001",
        categoryId: electronics.id,
        quantity: 25,
        price: 1299,
        minStock: 8
      },
      {
        name: "Notebook",
        sku: "NB-001",
        categoryId: stationery.id,
        quantity: 100,
        price: 99,
        minStock: 20
      }
    ],
    skipDuplicates: true
  });

  console.log("Database seeded successfully!");
};

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });