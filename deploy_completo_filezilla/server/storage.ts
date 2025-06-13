import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  CartItem, 
  InsertCartItem, 
  CartItemWithProduct,
  DisplayProduct,
  InventoryTransaction,
  InsertInventoryTransaction,
  Category,
  InsertCategory,
  Brand,
  InsertBrand,
  AuditLog,
  InsertAuditLog
} from "@shared/schema";
import session from "express-session";
import { DatabaseStorage } from "./storage-db";

// Interface for storage operations
export interface IStorage {
  // Session store para autenticação
  sessionStore: session.Store;
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Brand methods
  getBrands(): Promise<Brand[]>;
  getBrandById(id: number): Promise<Brand | undefined>;
  createBrand(brand: InsertBrand): Promise<Brand>;
  updateBrand(id: number, brand: Partial<InsertBrand>): Promise<Brand | undefined>;
  deleteBrand(id: number): Promise<boolean>;
  
  // Product methods
  getProducts(): Promise<DisplayProduct[]>;
  getProductById(id: number): Promise<DisplayProduct | undefined>;
  getProductsByCategory(category: string): Promise<DisplayProduct[]>;
  getFeaturedProducts(): Promise<DisplayProduct[]>;
  createProduct(product: InsertProduct): Promise<DisplayProduct>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<DisplayProduct | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Inventory methods
  updateProductStock(id: number, stockChange: number, userId: number, transactionType: string, notes?: string): Promise<DisplayProduct | undefined>;
  getProductStock(id: number): Promise<number>;
  getLowStockProducts(limit?: number): Promise<DisplayProduct[]>;
  getInventoryTransactions(productId?: number, limit?: number): Promise<InventoryTransaction[]>;
  createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction>;
  
  // Cart methods
  getCart(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(item: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(sessionId: string): Promise<boolean>;
  
  // Audit methods
  getAuditLogs(tableName?: string, recordId?: number, limit?: number): Promise<AuditLog[]>;
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
}

// Format price from cents to display format (R$ 00,00)
const formatPrice = (priceInCents: number): string => {
  return `R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}`;
};

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private brands: Map<number, Brand>;
  private cartItems: Map<number, CartItem>;
  private inventoryTransactions: Map<number, InventoryTransaction>;
  private auditLogs: Map<number, AuditLog>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCategoryId: number;
  private currentBrandId: number;
  private currentCartItemId: number;
  private currentInventoryTransactionId: number;
  private currentAuditLogId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.brands = new Map();
    this.cartItems = new Map();
    this.inventoryTransactions = new Map();
    this.auditLogs = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentBrandId = 1;
    this.currentCartItemId = 1;
    this.currentInventoryTransactionId = 1;
    this.currentAuditLogId = 1;
    
    // Create memory session store - inicializar com um store temporário
    this.sessionStore = new (session.MemoryStore)();
    
    // Substituir pelo memorystore quando disponível
    import('memorystore').then((memorystore) => {
      const MemoryStore = memorystore.default(session);
      this.sessionStore = new MemoryStore({
        checkPeriod: 86400000 // prune expired entries every 24h
      });
    });
    
    // Add admin user
    this.createUser({
      username: "admincynthia",
      password: "@admincynthiaemaik" // In a real app, this would be hashed
    }).then(user => {
      // Update admin status
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
    
    // Add some initial products, categories and brands
    this.seedCategories();
    this.seedBrands();
    this.seedProducts();
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const now = new Date();
    
    const category: Category = {
      id,
      name: insertCategory.name,
      description: insertCategory.description,
      imageUrl: insertCategory.imageUrl,
      slug: insertCategory.slug,
      isActive: insertCategory.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updateCategory: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return undefined;
    
    const updatedCategory: Category = {
      ...existingCategory,
      ...updateCategory,
      updatedAt: new Date()
    };
    
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Brand methods
  async getBrands(): Promise<Brand[]> {
    return Array.from(this.brands.values());
  }

  async getBrandById(id: number): Promise<Brand | undefined> {
    return this.brands.get(id);
  }

  async createBrand(insertBrand: InsertBrand): Promise<Brand> {
    const id = this.currentBrandId++;
    const now = new Date();
    
    const brand: Brand = {
      id,
      name: insertBrand.name,
      description: insertBrand.description || "",
      imageUrl: insertBrand.imageUrl || "",
      isActive: insertBrand.isActive ?? true,
      createdAt: now,
      updatedAt: now
    };
    
    this.brands.set(id, brand);
    return brand;
  }

  async updateBrand(id: number, updateBrand: Partial<InsertBrand>): Promise<Brand | undefined> {
    const existingBrand = this.brands.get(id);
    if (!existingBrand) return undefined;
    
    const updatedBrand: Brand = {
      ...existingBrand,
      ...updateBrand,
      updatedAt: new Date()
    };
    
    this.brands.set(id, updatedBrand);
    return updatedBrand;
  }

  async deleteBrand(id: number): Promise<boolean> {
    return this.brands.delete(id);
  }

  // Product methods
  async getProducts(): Promise<DisplayProduct[]> {
    return Array.from(this.products.values()).map(product => this.formatProduct(product));
  }

  async getProductById(id: number): Promise<DisplayProduct | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    return this.formatProduct(product);
  }

  async getProductsByCategory(category: string): Promise<DisplayProduct[]> {
    return Array.from(this.products.values())
      .filter(product => product.category === category)
      .map(product => this.formatProduct(product));
  }

  async getFeaturedProducts(): Promise<DisplayProduct[]> {
    return Array.from(this.products.values())
      .filter(product => product.isFeatured)
      .map(product => this.formatProduct(product));
  }

  async createProduct(insertProduct: InsertProduct): Promise<DisplayProduct> {
    const id = this.currentProductId++;
    const now = new Date();
    
    // Construímos manualmente para evitar problemas de tipo
    const product: Product = {
      id,
      name: insertProduct.name,
      description: insertProduct.description,
      price: insertProduct.price,
      category: insertProduct.category,
      brand: insertProduct.brand,
      imageUrl: insertProduct.imageUrl || "https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produto",
      videoUrl: insertProduct.videoUrl || "",
      isNew: insertProduct.isNew || false,
      isFeatured: insertProduct.isFeatured || false,
      stock: insertProduct.stock || 0,
      lowStockThreshold: insertProduct.lowStockThreshold || 5,
      sku: insertProduct.sku || `SKU-${id}`,
      createdAt: now
    };
    
    this.products.set(id, product);
    
    return this.formatProduct(product);
  }
  
  // Inventory management methods
  async updateProductStock(id: number, stockChange: number, userId: number, transactionType: string, notes?: string): Promise<DisplayProduct | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    // Update stock
    const updatedProduct = { 
      ...product, 
      stock: Math.max(0, product.stock + stockChange) // Prevent negative stock
    };
    this.products.set(id, updatedProduct);
    
    // Create inventory transaction
    const transaction = await this.createInventoryTransaction({
      productId: id,
      quantity: stockChange,
      type: transactionType,
      createdBy: userId,
      notes: notes || null,
    });
    
    return this.formatProduct(updatedProduct);
  }
  
  async getProductStock(id: number): Promise<number> {
    const product = this.products.get(id);
    return product ? product.stock : 0;
  }
  
  async getLowStockProducts(limit: number = 10): Promise<DisplayProduct[]> {
    return Array.from(this.products.values())
      .filter(product => product.stock <= product.lowStockThreshold)
      .slice(0, limit)
      .map(product => this.formatProduct(product));
  }
  
  async getInventoryTransactions(productId?: number, limit: number = 20): Promise<InventoryTransaction[]> {
    let transactions = Array.from(this.inventoryTransactions.values());
    
    if (productId) {
      transactions = transactions.filter(tx => tx.productId === productId);
    }
    
    // Sort by most recent first
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return transactions.slice(0, limit);
  }
  
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const id = this.currentInventoryTransactionId++;
    const now = new Date();
    
    const newTransaction: InventoryTransaction = {
      ...transaction,
      id,
      createdAt: now,
      notes: transaction.notes ?? null,
    };
    
    this.inventoryTransactions.set(id, newTransaction);
    return newTransaction;
  }
  
  // Helper method for consistent product formatting
  private formatProduct(product: Product): DisplayProduct {
    // Determine stock status
    let stockStatus: "in_stock" | "low_stock" | "out_of_stock" = "in_stock";
    
    if (product.stock <= 0) {
      stockStatus = "out_of_stock";
    } else if (product.stock <= product.lowStockThreshold) {
      stockStatus = "low_stock";
    }
    
    return {
      ...product,
      formattedPrice: formatPrice(product.price),
      stockStatus
    };
  }

  async updateProduct(id: number, updateProduct: Partial<InsertProduct>): Promise<DisplayProduct | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct = {
      ...existingProduct,
      ...updateProduct
    };
    
    this.products.set(id, updatedProduct);
    
    return this.formatProduct(updatedProduct);
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  // Cart methods
  async getCart(sessionId: string): Promise<CartItemWithProduct[]> {
    const cartItems = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId);
    
    const result: CartItemWithProduct[] = [];
    
    for (const item of cartItems) {
      const product = await this.getProductById(item.productId);
      if (product) {
        result.push({
          ...item,
          product
        });
      }
    }
    
    return result;
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists in cart
    const existingItem = Array.from(this.cartItems.values()).find(
      item => item.productId === insertItem.productId && item.sessionId === insertItem.sessionId
    );
    
    if (existingItem) {
      // Update quantity
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + insertItem.quantity
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    
    // Add new item
    const id = this.currentCartItemId++;
    const cartItem: CartItem = { ...insertItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return undefined;
    
    const updatedItem = {
      ...cartItem,
      quantity
    };
    
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    return this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const itemsToRemove = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId);
    
    for (const item of itemsToRemove) {
      this.cartItems.delete(item.id);
    }
    
    return true;
  }

  // Audit methods
  async getAuditLogs(tableName?: string, recordId?: number, limit: number = 50): Promise<AuditLog[]> {
    let logs = Array.from(this.auditLogs.values());
    
    if (tableName) {
      logs = logs.filter(log => log.tableName === tableName);
    }
    
    if (recordId) {
      logs = logs.filter(log => log.recordId === recordId);
    }
    
    return logs
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAuditLog(insertAuditLog: InsertAuditLog): Promise<AuditLog> {
    const id = this.currentAuditLogId++;
    const auditLog: AuditLog = {
      id,
      tableName: insertAuditLog.tableName,
      recordId: insertAuditLog.recordId,
      action: insertAuditLog.action,
      oldData: insertAuditLog.oldData,
      newData: insertAuditLog.newData,
      userId: insertAuditLog.userId,
      description: insertAuditLog.description || "",
      createdAt: new Date()
    };
    
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }

  // Seed initial products
  private async seedProducts() {
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
      await this.createProduct(product);
    }
  }

  private async seedBrands() {
    const initialBrands: InsertBrand[] = [
      {
        name: "Marca A",
        description: "Uma marca confiável de cosméticos",
        isActive: true
      },
      {
        name: "Marca B", 
        description: "Produtos de qualidade premium",
        isActive: true
      }
    ];

    for (const brandData of initialBrands) {
      await this.createBrand(brandData);
    }
  }

  private async seedCategories() {
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

    for (const categoryData of defaultCategories) {
      await this.createCategory(categoryData);
    }
  }
}

// Use o armazenamento apropriado baseado no ambiente
export const storage = process.env.DATABASE_URL && process.env.FORCE_MEMORY_STORAGE !== "true"
  ? new DatabaseStorage() 
  : new MemStorage();
