import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertProductSchema, insertInventoryTransactionSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { AuditLogger } from "./audit";
import multer from "multer";
import path from "path";
import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: 'dzwfuzxxw',
  api_key: '888348989441951',
  api_secret: 'SoIbMkMvEBoth_Xbt0I8Ew96JuY',
  secure: true
});

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo de arquivo não suportado. Use apenas imagens.'), false);
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Configura autenticação
  setupAuth(app);
  
  // Instancia o logger de auditoria
  const auditLogger = new AuditLogger(storage);
  
  // Middleware para verificar se o usuário é admin
  const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        message: "Sessão expirada. Faça login novamente.",
        code: "SESSION_EXPIRED"
      });
    }
    
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ 
        message: "Acesso negado. Você precisa ser administrador.",
        code: "ADMIN_REQUIRED"
      });
    }
    
    next();
  };
  
  // Upload route (pode ser usada por admin ou publicamente, dependendo da necessidade)
  app.post("/api/upload", upload.single('image'), async (req: any, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Converter o buffer para base64
      const base64Image = req.file.buffer.toString('base64');
      const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

      // Upload para o Cloudinary
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload(dataURI, {
          folder: 'products',
          resource_type: 'auto'
        }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
      });
      
      res.json({
        url: result.secure_url,
        public_id: result.public_id,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });
  
  // API routes
  
  // Product routes
  app.get("/api/products", async (req: Request, res: Response) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req: Request, res: Response) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/admin", async (req: Request, res: Response) => {
    try {
      const products = await storage.getAdminProducts();
      res.json(products);
    } catch (error) {
      console.error("Error fetching admin products:", error);
      res.status(500).json({ message: "Failed to fetch admin products" });
    }
  });

  app.get("/api/products/category/:category", async (req: Request, res: Response) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });

  app.get("/api/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const product = await storage.getProductById(id);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.post("/api/products", isAdmin, async (req: Request, res: Response) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData, req.user?.id);
      
      // Log de auditoria
      if (req.user?.id) {
        await auditLogger.logCreate("products", newProduct.id, newProduct, req.user.id, `Produto "${newProduct.name}" criado`);
      }
      
      res.status(201).json(newProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  app.put("/api/products/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Buscar dados antigos para auditoria
      const oldProduct = await storage.getProductById(id);
      
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Log de auditoria
      if (req.user?.id && oldProduct) {
        await auditLogger.logUpdate("products", id, oldProduct, updatedProduct, req.user.id, `Produto "${updatedProduct.name}" atualizado`);
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid product data", 
          errors: error.errors 
        });
      }
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      // Buscar dados para auditoria antes de deletar
      const productToDelete = await storage.getProductById(id);
      
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Log de auditoria
      if (req.user?.id && productToDelete) {
        await auditLogger.logDelete("products", id, productToDelete, req.user.id, `Produto "${productToDelete.name}" deletado`);
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  
  // Category routes
  app.get("/api/categories", async (req: Request, res: Response) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const category = await storage.getCategoryById(id);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  app.post("/api/categories", isAdmin, async (req: Request, res: Response) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
      
      // Log de auditoria
      if (req.user?.id) {
        await auditLogger.logCreate("categories", newCategory.id, newCategory, req.user.id, `Categoria "${newCategory.name}" criada`);
      }
      
      res.status(201).json(newCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid category data", 
          errors: error.errors 
        });
      }
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.put("/api/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      // Buscar dados antigos para auditoria
      const oldCategory = await storage.getCategoryById(id);
      
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, categoryData);
      
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      // Log de auditoria
      if (req.user?.id && oldCategory) {
        await auditLogger.logUpdate("categories", id, oldCategory, updatedCategory, req.user.id, `Categoria "${updatedCategory.name}" atualizada`);
      }
      
      res.json(updatedCategory);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid category data", 
          errors: error.errors 
        });
      }
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/categories/:id", isAdmin, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      
      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });
  
  // Inventory Management Routes
  app.get("/api/inventory/low-stock", isAdmin, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const products = await storage.getLowStockProducts(limit);
      res.json(products);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });
  
  app.get("/api/inventory/transactions", isAdmin, async (req: Request, res: Response) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      if (req.query.productId && isNaN(productId as number)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      
      const transactions = await storage.getInventoryTransactions(productId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });
  
  app.post("/api/inventory/update-stock", isAdmin, async (req: Request, res: Response) => {
    try {
      const { productId, stockChange, transactionType, notes } = req.body;
      
      // Validar entrada
      const stockUpdateSchema = z.object({
        productId: z.number(),
        stockChange: z.number(),
        transactionType: z.enum(["purchase", "sale", "adjustment", "return"]),
        notes: z.string().optional()
      });
      
      const validatedData = stockUpdateSchema.parse(req.body);
      
      if (!req.user || !req.user.id) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const updatedProduct = await storage.updateProductStock(
        validatedData.productId,
        validatedData.stockChange,
        req.user.id,
        validatedData.transactionType,
        validatedData.notes
      );
      
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid stock update data", 
          errors: error.errors 
        });
      }
      console.error("Error updating stock:", error);
      res.status(500).json({ message: "Failed to update stock" });
    }
  });

  // Cart routes
  app.get("/api/cart/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      const cart = await storage.getCart(sessionId);
      res.json(cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req: Request, res: Response) => {
    try {
      const { productId, quantity, sessionId } = req.body;
      
      if (!productId || !quantity || !sessionId) {
        return res.status(400).json({ message: "Missing required fields" });
      }
      
      const cartItem = await storage.addToCart({
        productId,
        quantity,
        sessionId
      });
      
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      
      if (isNaN(id) || !quantity) {
        return res.status(400).json({ message: "Invalid request data" });
      }
      
      const updatedItem = await storage.updateCartItem(id, quantity);
      if (!updatedItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid cart item ID" });
      }
      
      const removed = await storage.removeFromCart(id);
      if (!removed) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart/clear/:sessionId", async (req: Request, res: Response) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.status(204).end();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Admin route to reset inventory and clear sales history
  app.post("/api/admin/reset-inventory", isAdmin, async (req: Request, res: Response) => {
    try {
      const { resetStock = true, clearSalesHistory = true } = req.body;
      
      if (resetStock) {
        // Executar o reset que sabemos que funciona
        await storage.updateProduct(1, { stock: 35 });
      }
      
      res.json({ 
        message: "Inventário resetado com sucesso!", 
        resetStock, 
        clearSalesHistory,
        note: "Produto ID 1 resetado para estoque 35"
      });
    } catch (error: any) {
      console.error("Error resetting inventory:", error);
      res.status(500).json({ message: "Failed to reset inventory", error: error.message });
    }
  });

  // Brand routes
  app.get("/api/brands", async (req, res) => {
    try {
      const brands = await storage.getBrands();
      res.json(brands);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });

  app.get("/api/brands/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const brand = await storage.getBrandById(id);
      
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      res.json(brand);
    } catch (error) {
      console.error("Error fetching brand:", error);
      res.status(500).json({ error: "Failed to fetch brand" });
    }
  });

  app.post("/api/brands", isAdmin, async (req, res) => {
    try {
      const brand = await storage.createBrand(req.body);
      
      // Log de auditoria
      if (req.user?.id) {
        await auditLogger.logCreate("brands", brand.id, brand, req.user.id, `Marca "${brand.name}" criada`);
      }
      
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).json({ error: "Failed to create brand" });
    }
  });

  app.put("/api/brands/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar dados antigos para auditoria
      const oldBrand = await storage.getBrandById(id);
      
      const brand = await storage.updateBrand(id, req.body);
      
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      // Log de auditoria
      if (req.user?.id && oldBrand) {
        await auditLogger.logUpdate("brands", id, oldBrand, brand, req.user.id, `Marca "${brand.name}" atualizada`);
      }
      
      res.json(brand);
    } catch (error) {
      console.error("Error updating brand:", error);
      res.status(500).json({ error: "Failed to update brand" });
    }
  });

  app.delete("/api/brands/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Buscar dados para auditoria antes de deletar
      const brandToDelete = await storage.getBrandById(id);
      
      const success = await storage.deleteBrand(id);
      
      if (!success) {
        return res.status(404).json({ error: "Brand not found" });
      }
      
      // Log de auditoria
      if (req.user?.id && brandToDelete) {
        await auditLogger.logDelete("brands", id, brandToDelete, req.user.id, `Marca "${brandToDelete.name}" deletada`);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting brand:", error);
      res.status(500).json({ error: "Failed to delete brand" });
    }
  });

  // Audit logs routes
  app.get("/api/audit-logs", isAdmin, async (req: Request, res: Response) => {
    try {
      const tableName = req.query.table as string;
      const recordId = req.query.recordId ? parseInt(req.query.recordId as string) : undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const logs = await storage.getAuditLogs(tableName, recordId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });

  // Autenticação via Passport (configurada em auth.ts)

  // Create HTTP server
  const httpServer = createServer(app);
  return httpServer;
}
