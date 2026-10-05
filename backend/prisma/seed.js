import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/config/prisma.js";

const main = async () => {
  const password = await bcrypt.hash("Admin12345", 12);

  await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@example.com",
      password,
      role: "ADMIN"
    }
  });

  await prisma.product.createMany({
    data: [
      { name: "Wireless Mouse", sku: "WM-001", category: "Electronics", quantity: 40, price: 799, minStock: 10 },
      { name: "Keyboard", sku: "KB-001", category: "Electronics", quantity: 25, price: 1299, minStock: 8 },
      { name: "Notebook", sku: "NB-001", category: "Stationery", quantity: 100, price: 99, minStock: 20 }
    ],
    skipDuplicates: true
  });
};

main().finally(async () => prisma.$disconnect());
