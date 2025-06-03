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
  const hashedPassword = await hashPassword("admin123");
  await db.insert(users).values({
    username: "admin",
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
      name: "Base Líquida Ultra HD",
      description: "Base de alta cobertura com acabamento natural, ideal para peles normais a secas.",
      price: 8990, // R$ 89,90
      category: "face",
      brand: "MAC",
      imageUrl: "https://images.unsplash.com/photo-1625093742435-6fa192b6fb10?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      isNew: true,
      isFeatured: false,
      stock: 45,
      lowStockThreshold: 10,
      sku: "BASE-HD-001"
    },
    {
      name: "Paleta de Sombras Colorful",
      description: "Paleta com 12 cores altamente pigmentadas, com acabamentos matte e shimmer.",
      price: 12990, // R$ 129,90
      category: "eyes",
      brand: "Maybelline",
      imageUrl: "https://pixabay.com/get/g30a89816ea1c2b83d0bf92e96f89d762568a8bf4f211be224d1c9b4e645e88bc80a858480604b2afd0fd94a1d5b5062f5f4f3e51dd9f427e1894c659ade5f25a_1280.jpg",
      isNew: false,
      isFeatured: false,
      stock: 18,
      lowStockThreshold: 5,
      sku: "PALETTE-COL-002"
    },
    {
      name: "Batom Matte Longa Duração",
      description: "Batom de longa duração com acabamento matte e textura cremosa que não resseca os lábios.",
      price: 4590, // R$ 45,90
      category: "lips",
      brand: "Ruby Rose",
      imageUrl: "https://pixabay.com/get/gaf98a7f448dc320934892b79c7238885f0a1289f295b5a29ec26c6563e5d403dd2f8ea00be4927a4034d22c34941048fb9c5f62ee56ae9a4b99aadd1c7eb7129_1280.jpg",
      isNew: false,
      isFeatured: true,
      stock: 3,
      lowStockThreshold: 5,
      sku: "LIPSTICK-MAT-003"
    },
    {
      name: "Kit de Pincéis Profissionais",
      description: "Kit com 12 pincéis profissionais para maquiagem completa, com cerdas sintéticas de alta qualidade.",
      price: 19990, // R$ 199,90
      category: "accessories",
      brand: "Sigma Beauty",
      imageUrl: "https://pixabay.com/get/gd526e95c82444b43af92cf85cb8947b12e2ca7b9b29fbc301498f8064e88df85613583172ed66b1ad35a6484d7fb63ab3334bb34c94310931992337175b588bd_1280.jpg",
      isNew: false,
      isFeatured: false,
      stock: 0,
      lowStockThreshold: 5,
      sku: "BRUSH-KIT-004"
    },
    {
      name: "Máscara para Cílios Volume Extreme",
      description: "Máscara para cílios de volume extremo, à prova d'água e longa duração.",
      price: 7590, // R$ 75,90
      category: "eyes",
      brand: "L'Oréal",
      imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      isNew: false,
      isFeatured: false,
      stock: 25,
      lowStockThreshold: 5,
      sku: "MASCARA-001"
    },
    {
      name: "Iluminador Gold Glow",
      description: "Iluminador em pó com acabamento dourado que proporciona um brilho natural à pele.",
      price: 6990, // R$ 69,90
      category: "face",
      brand: "NARS",
      imageUrl: "https://images.unsplash.com/photo-1591375372156-542495912da9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
      isNew: true,
      isFeatured: false,
      stock: 30,
      lowStockThreshold: 8,
      sku: "HIGHLIGHT-001"
    },
    {
      name: "Base Premium Gold",
      description: "Nossa base mais vendida, com cobertura média a alta e acabamento natural.",
      price: 11990, // R$ 119,90
      category: "face",
      brand: "Urban Decay",
      imageUrl: "https://pixabay.com/get/g77746cb48f7952b6b4f637df5e2bfc1334981d9b98a82ae0d6b6c6c4f4b7aa4807a591c37f2df4c79bfe3e0445c7891935986d2707d6fe3d52a640ed4f4bd711_1280.jpg",
      isNew: false,
      isFeatured: true,
      stock: 20,
      lowStockThreshold: 10,
      sku: "BASE-GOLD-001"
    },
    {
      name: "Paleta de Sombras Sunset",
      description: "18 cores inspiradas no pôr do sol, altamente pigmentadas e fáceis de aplicar.",
      price: 14990, // R$ 149,90
      category: "eyes",
      brand: "Too Faced",
      imageUrl: "https://pixabay.com/get/gf0fb7fc1bd67bb986daaa8dd41eee373994a1ac67e01d761c3b0562ed52e8eb364f5d1ce1a466e58a2f3506436a3e79033d1e03b59fae40fb738c5fd69a86eb0_1280.jpg",
      isNew: false,
      isFeatured: true,
      stock: 15,
      lowStockThreshold: 5,
      sku: "SUNSET-PAL-001"
    },
    {
      name: "Kit Completo para Lábios",
      description: "4 batons e 2 glosses em cores versáteis para todos os momentos.",
      price: 19990, // R$ 199,90
      category: "lips",
      brand: "Fenty Beauty",
      imageUrl: "https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
      isNew: false,
      isFeatured: true,
      stock: 12,
      lowStockThreshold: 5,
      sku: "LIPS-KIT-001"
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