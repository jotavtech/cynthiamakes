import dotenv from "dotenv";
dotenv.config();

import { db } from "./db";
import { users, categories, brands } from "@shared/schema";
import { eq } from "drizzle-orm";

async function initializeDatabase() {
  console.log("🔄 Inicializando banco de dados...");
  
  try {
    // Verificar se o usuário admin já existe
    const [existingAdmin] = await db.select().from(users).where(eq(users.username, "admincynthia"));
    
    if (!existingAdmin) {
      console.log("👤 Criando usuário admin...");
      await db.insert(users).values({
        username: "admincynthia",
        password: "@admincynthiaemaik", // Em produção seria hash
        isAdmin: true
      });
      console.log("✅ Usuário admin criado!");
    } else {
      console.log("👤 Usuário admin já existe");
    }
    
    // Verificar e criar categorias padrão
    const existingCategories = await db.select().from(categories);
    
    if (existingCategories.length === 0) {
      console.log("📂 Criando categorias padrão...");
      
      const defaultCategories = [
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
      
      for (const category of defaultCategories) {
        await db.insert(categories).values(category);
      }
      
      console.log("✅ Categorias criadas!");
    } else {
      console.log("📂 Categorias já existem");
    }
    
    // Verificar e criar marcas baseadas nos produtos existentes
    const existingBrands = await db.select().from(brands);
    
    if (existingBrands.length === 0) {
      console.log("🏷️ Criando marcas baseadas nos produtos...");
      
      // Buscar marcas únicas dos produtos
      const { products } = await import("@shared/schema");
      const allProducts = await db.select().from(products);
      const brandSet = new Set(allProducts.map(p => p.brand));
      const uniqueBrands = Array.from(brandSet);
      
      for (const brandName of uniqueBrands) {
        if (brandName) {
          await db.insert(brands).values({
            name: brandName,
            description: `Marca ${brandName}`,
            isActive: true
          });
        }
      }
      
      console.log(`✅ ${uniqueBrands.length} marcas criadas!`);
    } else {
      console.log("🏷️ Marcas já existem");
    }
    
    console.log("🎉 Inicialização do banco concluída!");
    
  } catch (error) {
    console.error("❌ Erro ao inicializar banco:", error);
    throw error;
  }
}

// Executar se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  initializeDatabase()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { initializeDatabase }; 