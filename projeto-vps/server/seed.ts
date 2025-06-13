import { db } from "./db";
import { users, categories, products, InsertCategory, InsertProduct } from "@shared/schema";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await hashPassword("@admincynthiaemaik");
  await db.insert(users).values({
    username: "admincynthia",
    password: hashedPassword,
    isAdmin: true
  }).onConflictDoNothing();

  // Seed categories
  const defaultCategories: InsertCategory[] = [
    {
      name: "Rosto",
      description: "Bases, corretivos e mais",
      imageUrl: "https://images.unsplash.com/photo-1631730486572-226d1f595b68?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
      slug: "face",
      isActive: true
    },
    {
      name: "Olhos",
      description: "Sombras, delineadores e máscaras",
      imageUrl: "https://pixabay.com/get/g9161a855dd5bbc4d37d4bef8d8a233cf29275ef3fd43a5e9404df7fa5be341196aa9600f3ab509dd6750af15ebcbc3b3_1280.jpg",
      slug: "eyes",
      isActive: true
    },
    {
      name: "Lábios",
      description: "Batons, glosses e lápis",
      imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
      slug: "lips",
      isActive: true
    },
    {
      name: "Perfumaria",
      description: "Perfumes, colônias e fragrâncias",
      imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
      slug: "perfumery",
      isActive: true
    },
    {
      name: "Acessórios",
      description: "Pincéis, esponjas e mais",
      imageUrl: "https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
      slug: "accessories",
      isActive: true
    }
  ];

  for (const categoryData of defaultCategories) {
    await db.insert(categories).values(categoryData).onConflictDoNothing();
  }

  // Seed products
  const initialProducts: InsertProduct[] = [
    {
      name: "Base Líquida Hidratante",
      description: "Base de cobertura natural com proteção solar, ideal para uso diário.",
      price: 4500, // R$ 45,00
      category: "face",
      brand: "Marca A",
      imageUrl: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      isNew: false,
      isFeatured: false,
      stock: 25,
      lowStockThreshold: 5,
      sku: "BASE-001"
    },
    {
      name: "Batom Cremoso",
      description: "Batom cremoso de longa duração com acabamento acetinado.",
      price: 2800, // R$ 28,00
      category: "lips",
      brand: "Marca B",
      imageUrl: "https://pixabay.com/get/gaf98a7f448dc320934892b79c7238885f0a1289f295b5a29ec26c6563e5d403dd2f8ea00be4927a4034d22c34941048fb9c5f62ee56ae9a4b99aadd1c7eb7129_1280.jpg",
      isNew: true,
      isFeatured: true,
      stock: 15,
      lowStockThreshold: 5,
      sku: "BATOM-001"
    }
  ];

  for (const product of initialProducts) {
    await db.insert(products).values(product).onConflictDoNothing();
  }

  console.log("✅ Database seeded successfully!");
}

// Run seed if this is the main module
seedDatabase().catch(console.error);

export { seedDatabase }; 