var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import dotenv2 from "dotenv";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
import session3 from "express-session";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  auditLogs: () => auditLogs,
  brands: () => brands,
  cartItems: () => cartItems,
  categories: () => categories,
  insertAuditLogSchema: () => insertAuditLogSchema,
  insertBrandSchema: () => insertBrandSchema,
  insertCartItemSchema: () => insertCartItemSchema,
  insertCategorySchema: () => insertCategorySchema,
  insertInventoryTransactionSchema: () => insertInventoryTransactionSchema,
  insertProductSchema: () => insertProductSchema,
  insertUserSchema: () => insertUserSchema,
  inventoryTransactions: () => inventoryTransactions,
  products: () => products,
  session: () => session,
  users: () => users
});
import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull()
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true
});
var session = pgTable("session", {
  sid: text("sid").primaryKey(),
  sess: text("sess").notNull(),
  expire: timestamp("expire").notNull()
});
var categories = pgTable("product_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  imageUrl: text("image_url").notNull(),
  slug: text("slug").notNull().unique(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var brands = pgTable("brands", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description").default(""),
  imageUrl: text("image_url").default(""),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertBrandSchema = createInsertSchema(brands).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(),
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  imageUrl: text("image_url").notNull().default("https://via.placeholder.com/400x400/f3f4f6/9ca3af?text=Produto"),
  videoUrl: text("video_url").notNull().default(""),
  isNew: boolean("is_new").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  stock: integer("stock").default(0).notNull(),
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(),
  sku: text("sku").notNull().default(""),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true
});
var cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  sessionId: text("session_id").notNull()
});
var insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true
});
var inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  type: text("type").notNull(),
  notes: text("notes").default(""),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true
});
var auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  tableName: text("table_name").notNull(),
  // 'products', 'categories', 'brands'
  recordId: integer("record_id").notNull(),
  // ID do registro modificado
  action: text("action").notNull(),
  // 'created', 'updated', 'deleted'
  oldData: jsonb("old_data"),
  // Dados anteriores (null para created)
  newData: jsonb("new_data"),
  // Dados novos (null para deleted)
  userId: integer("user_id").notNull(),
  // ID do usuário que fez a modificação
  description: text("description").default(""),
  // Descrição da modificação
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true
});

// server/db.ts
import dotenv from "dotenv";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
dotenv.config();
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({ connectionString: process.env.DATABASE_URL });
var db = drizzle(pool, { schema: schema_exports });

// server/storage-db.ts
import { eq, and, desc } from "drizzle-orm";

// client/src/lib/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function formatPrice(priceInCents) {
  return `R$ ${(priceInCents / 100).toFixed(2).replace(".", ",")}`;
}

// server/storage-db.ts
import session2 from "express-session";
import connectPg from "connect-pg-simple";
var PostgresSessionStore = connectPg(session2);
var DatabaseStorage = class {
  sessionStore;
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: "session"
    });
  }
  // Métodos de usuário
  async getUser(id) {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  async getUserByUsername(username) {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  async createUser(insertUser) {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }
  // Métodos de categoria
  async getCategories() {
    const allCategories = await db.select().from(categories);
    return allCategories;
  }
  async getCategoryById(id) {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }
  async createCategory(insertCategory) {
    const [category] = await db.insert(categories).values(insertCategory).returning();
    return category;
  }
  async updateCategory(id, updateData) {
    const [category] = await db.update(categories).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(categories.id, id)).returning();
    return category;
  }
  async deleteCategory(id) {
    const result = await db.delete(categories).where(eq(categories.id, id)).returning({ id: categories.id });
    return result.length > 0;
  }
  // Métodos de marca
  async getBrands() {
    const allBrands = await db.select().from(brands);
    return allBrands;
  }
  async getBrandById(id) {
    const [brand] = await db.select().from(brands).where(eq(brands.id, id));
    return brand;
  }
  async createBrand(insertBrand) {
    const [brand] = await db.insert(brands).values(insertBrand).returning();
    return brand;
  }
  async updateBrand(id, updateData) {
    const [brand] = await db.update(brands).set({ ...updateData, updatedAt: /* @__PURE__ */ new Date() }).where(eq(brands.id, id)).returning();
    return brand;
  }
  async deleteBrand(id) {
    const result = await db.delete(brands).where(eq(brands.id, id)).returning({ id: brands.id });
    return result.length > 0;
  }
  // Métodos de produto
  async getProducts() {
    const allProducts = await db.select().from(products);
    return allProducts.map(this.formatProduct);
  }
  async getProductById(id) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product ? this.formatProduct(product) : void 0;
  }
  async getProductsByCategory(category) {
    const filteredProducts = await db.select().from(products).where(eq(products.category, category));
    return filteredProducts.map(this.formatProduct);
  }
  async getFeaturedProducts() {
    const featuredProducts = await db.select().from(products).where(eq(products.isFeatured, true)).limit(4);
    return featuredProducts.map(this.formatProduct);
  }
  async createProduct(insertProduct) {
    const [product] = await db.insert(products).values(insertProduct).returning();
    return this.formatProduct(product);
  }
  async updateProduct(id, updateData) {
    const [product] = await db.update(products).set(updateData).where(eq(products.id, id)).returning();
    return product ? this.formatProduct(product) : void 0;
  }
  async deleteProduct(id) {
    const result = await db.delete(products).where(eq(products.id, id)).returning({ id: products.id });
    return result.length > 0;
  }
  // Métodos de carrinho
  async getCart(sessionId) {
    const items = await db.select().from(cartItems).where(eq(cartItems.sessionId, sessionId));
    const result = [];
    for (const item of items) {
      const [product] = await db.select().from(products).where(eq(products.id, item.productId));
      if (product) {
        result.push({
          ...item,
          product: this.formatProduct(product)
        });
      }
    }
    return result;
  }
  async addToCart(insertItem) {
    const [existingItem] = await db.select().from(cartItems).where(
      and(
        eq(cartItems.productId, insertItem.productId),
        eq(cartItems.sessionId, insertItem.sessionId)
      )
    );
    if (existingItem) {
      const newQuantity = existingItem.quantity + insertItem.quantity;
      const [updatedItem] = await db.update(cartItems).set({ quantity: newQuantity }).where(eq(cartItems.id, existingItem.id)).returning();
      return updatedItem;
    }
    const [newItem] = await db.insert(cartItems).values(insertItem).returning();
    return newItem;
  }
  async updateCartItem(id, quantity) {
    const [updatedItem] = await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, id)).returning();
    return updatedItem;
  }
  async removeFromCart(id) {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning({ id: cartItems.id });
    return result.length > 0;
  }
  async clearCart(sessionId) {
    const result = await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId)).returning({ id: cartItems.id });
    return result.length > 0;
  }
  // Métodos de inventário
  async updateProductStock(id, stockChange, userId, transactionType, notes) {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    if (!product) return void 0;
    const newStock = Math.max(0, product.stock + stockChange);
    const [updatedProduct] = await db.update(products).set({ stock: newStock }).where(eq(products.id, id)).returning();
    if (!updatedProduct) return void 0;
    await this.createInventoryTransaction({
      type: transactionType,
      productId: id,
      quantity: stockChange,
      createdBy: userId,
      notes: notes || null
    });
    return this.formatProduct(updatedProduct);
  }
  async getProductStock(id) {
    const [product] = await db.select({ stock: products.stock }).from(products).where(eq(products.id, id));
    return product ? product.stock : 0;
  }
  async getLowStockProducts(limit = 20) {
    const lowStockProducts = await db.select().from(products).where(
      // Não podemos usar operadores diretamente entre colunas na drizzle
      // Vamos buscar todos os produtos e filtrar na aplicação
      eq(products.id, products.id)
    ).limit(limit);
    const filteredProducts = lowStockProducts.filter(
      (product) => product.stock === 0 || product.stock <= product.lowStockThreshold
    );
    return filteredProducts.map((product) => {
      const formattedProduct = this.formatProduct(product);
      if (product.stock === 0) {
        formattedProduct.stockStatus = "out_of_stock";
      } else if (product.stock <= product.lowStockThreshold) {
        formattedProduct.stockStatus = "low_stock";
      } else {
        formattedProduct.stockStatus = "in_stock";
      }
      return formattedProduct;
    });
  }
  async getInventoryTransactions(productId, limit = 20) {
    if (productId) {
      const transactions = await db.select().from(inventoryTransactions).where(eq(inventoryTransactions.productId, productId)).orderBy(desc(inventoryTransactions.createdAt)).limit(limit);
      return transactions;
    } else {
      const transactions = await db.select().from(inventoryTransactions).orderBy(desc(inventoryTransactions.createdAt)).limit(limit);
      return transactions;
    }
  }
  async createInventoryTransaction(transaction) {
    const [newTransaction] = await db.insert(inventoryTransactions).values({
      ...transaction,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return newTransaction;
  }
  // Métodos de auditoria
  async getAuditLogs(tableName, recordId, limit = 50) {
    const conditions = [];
    if (tableName) {
      conditions.push(eq(auditLogs.tableName, tableName));
    }
    if (recordId) {
      conditions.push(eq(auditLogs.recordId, recordId));
    }
    let logs;
    if (conditions.length > 0) {
      logs = await db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(limit);
    } else {
      logs = await db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit);
    }
    return logs;
  }
  async createAuditLog(insertAuditLog) {
    const [auditLog] = await db.insert(auditLogs).values(insertAuditLog).returning();
    return auditLog;
  }
  // Métodos auxiliares
  formatProduct(product) {
    const stockStatus = product.stock === 0 ? "out_of_stock" : product.stock <= product.lowStockThreshold ? "low_stock" : "in_stock";
    return {
      ...product,
      formattedPrice: formatPrice(product.price),
      stockStatus
    };
  }
};

// server/storage.ts
var formatPrice2 = (priceInCents) => {
  return `R$ ${(priceInCents / 100).toFixed(2).replace(".", ",")}`;
};
var MemStorage = class {
  users;
  products;
  categories;
  brands;
  cartItems;
  inventoryTransactions;
  auditLogs;
  currentUserId;
  currentProductId;
  currentCategoryId;
  currentBrandId;
  currentCartItemId;
  currentInventoryTransactionId;
  currentAuditLogId;
  sessionStore;
  constructor() {
    this.users = /* @__PURE__ */ new Map();
    this.products = /* @__PURE__ */ new Map();
    this.categories = /* @__PURE__ */ new Map();
    this.brands = /* @__PURE__ */ new Map();
    this.cartItems = /* @__PURE__ */ new Map();
    this.inventoryTransactions = /* @__PURE__ */ new Map();
    this.auditLogs = /* @__PURE__ */ new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCategoryId = 1;
    this.currentBrandId = 1;
    this.currentCartItemId = 1;
    this.currentInventoryTransactionId = 1;
    this.currentAuditLogId = 1;
    this.sessionStore = new session3.MemoryStore();
    import("memorystore").then((memorystore) => {
      const MemoryStore = memorystore.default(session3);
      this.sessionStore = new MemoryStore({
        checkPeriod: 864e5
        // prune expired entries every 24h
      });
    });
    this.createUser({
      username: "admincynthia",
      password: "@admincynthiaemaik"
      // In a real app, this would be hashed
    }).then((user) => {
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
    this.seedCategories();
    this.seedBrands();
    this.seedProducts();
  }
  // User methods
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByUsername(username) {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  async createUser(insertUser) {
    const id = this.currentUserId++;
    const user = { ...insertUser, id, isAdmin: false };
    this.users.set(id, user);
    return user;
  }
  // Category methods
  async getCategories() {
    return Array.from(this.categories.values());
  }
  async getCategoryById(id) {
    return this.categories.get(id);
  }
  async createCategory(insertCategory) {
    const id = this.currentCategoryId++;
    const now = /* @__PURE__ */ new Date();
    const category = {
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
  async updateCategory(id, updateCategory) {
    const existingCategory = this.categories.get(id);
    if (!existingCategory) return void 0;
    const updatedCategory = {
      ...existingCategory,
      ...updateCategory,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }
  async deleteCategory(id) {
    return this.categories.delete(id);
  }
  // Brand methods
  async getBrands() {
    return Array.from(this.brands.values());
  }
  async getBrandById(id) {
    return this.brands.get(id);
  }
  async createBrand(insertBrand) {
    const id = this.currentBrandId++;
    const now = /* @__PURE__ */ new Date();
    const brand = {
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
  async updateBrand(id, updateBrand) {
    const existingBrand = this.brands.get(id);
    if (!existingBrand) return void 0;
    const updatedBrand = {
      ...existingBrand,
      ...updateBrand,
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.brands.set(id, updatedBrand);
    return updatedBrand;
  }
  async deleteBrand(id) {
    return this.brands.delete(id);
  }
  // Product methods
  async getProducts() {
    return Array.from(this.products.values()).map((product) => this.formatProduct(product));
  }
  async getProductById(id) {
    const product = this.products.get(id);
    if (!product) return void 0;
    return this.formatProduct(product);
  }
  async getProductsByCategory(category) {
    return Array.from(this.products.values()).filter((product) => product.category === category).map((product) => this.formatProduct(product));
  }
  async getFeaturedProducts() {
    return Array.from(this.products.values()).filter((product) => product.isFeatured).map((product) => this.formatProduct(product));
  }
  async createProduct(insertProduct) {
    const id = this.currentProductId++;
    const now = /* @__PURE__ */ new Date();
    const product = {
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
  async updateProductStock(id, stockChange, userId, transactionType, notes) {
    const product = this.products.get(id);
    if (!product) return void 0;
    const updatedProduct = {
      ...product,
      stock: Math.max(0, product.stock + stockChange)
      // Prevent negative stock
    };
    this.products.set(id, updatedProduct);
    const transaction = await this.createInventoryTransaction({
      productId: id,
      quantity: stockChange,
      type: transactionType,
      createdBy: userId,
      notes: notes || null
    });
    return this.formatProduct(updatedProduct);
  }
  async getProductStock(id) {
    const product = this.products.get(id);
    return product ? product.stock : 0;
  }
  async getLowStockProducts(limit = 10) {
    return Array.from(this.products.values()).filter((product) => product.stock <= product.lowStockThreshold).slice(0, limit).map((product) => this.formatProduct(product));
  }
  async getInventoryTransactions(productId, limit = 20) {
    let transactions = Array.from(this.inventoryTransactions.values());
    if (productId) {
      transactions = transactions.filter((tx) => tx.productId === productId);
    }
    transactions.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    return transactions.slice(0, limit);
  }
  async createInventoryTransaction(transaction) {
    const id = this.currentInventoryTransactionId++;
    const now = /* @__PURE__ */ new Date();
    const newTransaction = {
      ...transaction,
      id,
      createdAt: now,
      notes: transaction.notes ?? null
    };
    this.inventoryTransactions.set(id, newTransaction);
    return newTransaction;
  }
  // Helper method for consistent product formatting
  formatProduct(product) {
    let stockStatus = "in_stock";
    if (product.stock <= 0) {
      stockStatus = "out_of_stock";
    } else if (product.stock <= product.lowStockThreshold) {
      stockStatus = "low_stock";
    }
    return {
      ...product,
      formattedPrice: formatPrice2(product.price),
      stockStatus
    };
  }
  async updateProduct(id, updateProduct) {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return void 0;
    const updatedProduct = {
      ...existingProduct,
      ...updateProduct
    };
    this.products.set(id, updatedProduct);
    return this.formatProduct(updatedProduct);
  }
  async deleteProduct(id) {
    return this.products.delete(id);
  }
  // Cart methods
  async getCart(sessionId) {
    const cartItems2 = Array.from(this.cartItems.values()).filter((item) => item.sessionId === sessionId);
    const result = [];
    for (const item of cartItems2) {
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
  async addToCart(insertItem) {
    const existingItem = Array.from(this.cartItems.values()).find(
      (item) => item.productId === insertItem.productId && item.sessionId === insertItem.sessionId
    );
    if (existingItem) {
      const updatedItem = {
        ...existingItem,
        quantity: existingItem.quantity + insertItem.quantity
      };
      this.cartItems.set(existingItem.id, updatedItem);
      return updatedItem;
    }
    const id = this.currentCartItemId++;
    const cartItem = { ...insertItem, id };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }
  async updateCartItem(id, quantity) {
    const cartItem = this.cartItems.get(id);
    if (!cartItem) return void 0;
    const updatedItem = {
      ...cartItem,
      quantity
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }
  async removeFromCart(id) {
    return this.cartItems.delete(id);
  }
  async clearCart(sessionId) {
    const itemsToRemove = Array.from(this.cartItems.values()).filter((item) => item.sessionId === sessionId);
    for (const item of itemsToRemove) {
      this.cartItems.delete(item.id);
    }
    return true;
  }
  // Audit methods
  async getAuditLogs(tableName, recordId, limit = 50) {
    let logs = Array.from(this.auditLogs.values());
    if (tableName) {
      logs = logs.filter((log2) => log2.tableName === tableName);
    }
    if (recordId) {
      logs = logs.filter((log2) => log2.recordId === recordId);
    }
    return logs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, limit);
  }
  async createAuditLog(insertAuditLog) {
    const id = this.currentAuditLogId++;
    const auditLog = {
      id,
      tableName: insertAuditLog.tableName,
      recordId: insertAuditLog.recordId,
      action: insertAuditLog.action,
      oldData: insertAuditLog.oldData,
      newData: insertAuditLog.newData,
      userId: insertAuditLog.userId,
      description: insertAuditLog.description || "",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.auditLogs.set(id, auditLog);
    return auditLog;
  }
  // Seed initial products
  async seedProducts() {
    const initialProducts = [
      {
        name: "Base L\xEDquida Hidratante",
        description: "Base de cobertura natural com prote\xE7\xE3o solar, ideal para uso di\xE1rio.",
        price: 4500,
        // R$ 45,00
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
        description: "Batom cremoso de longa dura\xE7\xE3o com acabamento acetinado.",
        price: 2800,
        // R$ 28,00
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
  async seedBrands() {
    const initialBrands = [
      {
        name: "Marca A",
        description: "Uma marca confi\xE1vel de cosm\xE9ticos",
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
  async seedCategories() {
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
        description: "Sombras, delineadores e m\xE1scaras",
        imageUrl: "https://pixabay.com/get/g9161a855dd5bbc4d37d4bef8d8a233cf29275ef3fd43a5e9404df7fa5be341196aa9600f3ab509dd6750af15ebcbc3b3_1280.jpg",
        slug: "eyes",
        isActive: true
      },
      {
        name: "L\xE1bios",
        description: "Batons, glosses e l\xE1pis",
        imageUrl: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
        slug: "lips",
        isActive: true
      },
      {
        name: "Perfumaria",
        description: "Perfumes, col\xF4nias e fragr\xE2ncias",
        imageUrl: "https://images.unsplash.com/photo-1541643600914-78b084683601?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
        slug: "perfumery",
        isActive: true
      },
      {
        name: "Acess\xF3rios",
        description: "Pinc\xE9is, esponjas e mais",
        imageUrl: "https://images.unsplash.com/photo-1567721913486-6585f069b332?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=600&q=80",
        slug: "accessories",
        isActive: true
      }
    ];
    for (const categoryData of defaultCategories) {
      await this.createCategory(categoryData);
    }
  }
};
var storage = process.env.DATABASE_URL && process.env.FORCE_MEMORY_STORAGE !== "true" ? new DatabaseStorage() : new MemStorage();

// server/routes.ts
import { z } from "zod";

// server/auth.ts
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import session4 from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
var scryptAsync = promisify(scrypt);
async function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const buf = await scryptAsync(password, salt, 64);
  return `${buf.toString("hex")}.${salt}`;
}
async function comparePasswords(supplied, stored) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = await scryptAsync(supplied, salt, 64);
  return timingSafeEqual(hashedBuf, suppliedBuf);
}
function setupAuth(app2) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "minha-chave-secreta-temporaria",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1e3 * 60 * 10
      // 10 minutos para sessão admin
    }
  };
  app2.set("trust proxy", 1);
  app2.use(session4(sessionSettings));
  app2.use(passport.initialize());
  app2.use(passport.session());
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        const isHashedPassword = user?.password?.includes(".");
        if (!user || isHashedPassword && !await comparePasswords(password, user.password) || !isHashedPassword && password !== user.password) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    })
  );
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
  app2.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Nome de usu\xE1rio j\xE1 existe" });
      }
      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password)
      });
      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });
  app2.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });
  app2.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Erro ao destruir sess\xE3o:", destroyErr);
          return next(destroyErr);
        }
        res.clearCookie("connect.sid");
        res.sendStatus(200);
      });
    });
  });
  app2.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
  app2.get("/api/admin/status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        authenticated: false,
        message: "Sess\xE3o n\xE3o encontrada"
      });
    }
    if (!req.user.isAdmin) {
      return res.status(403).json({
        authenticated: true,
        isAdmin: false,
        message: "Usu\xE1rio n\xE3o \xE9 administrador"
      });
    }
    res.json({
      authenticated: true,
      isAdmin: true,
      user: req.user,
      sessionExpires: req.session.cookie.expires
    });
  });
}

// server/audit.ts
var AuditLogger = class {
  constructor(storage2) {
    this.storage = storage2;
  }
  async logCreate(tableName, recordId, newData, userId, description) {
    const auditLog = {
      tableName,
      recordId,
      action: "created",
      oldData: null,
      newData,
      userId,
      description: description || `${tableName} criado`
    };
    await this.storage.createAuditLog(auditLog);
  }
  async logUpdate(tableName, recordId, oldData, newData, userId, description) {
    const auditLog = {
      tableName,
      recordId,
      action: "updated",
      oldData,
      newData,
      userId,
      description: description || `${tableName} atualizado`
    };
    await this.storage.createAuditLog(auditLog);
  }
  async logDelete(tableName, recordId, oldData, userId, description) {
    const auditLog = {
      tableName,
      recordId,
      action: "deleted",
      oldData,
      newData: null,
      userId,
      description: description || `${tableName} deletado`
    };
    await this.storage.createAuditLog(auditLog);
  }
};

// server/routes.ts
import multer from "multer";
var upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024
    // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Tipo de arquivo n\xE3o suportado. Use apenas imagens."), false);
    }
  }
});
async function registerRoutes(app2) {
  setupAuth(app2);
  const auditLogger = new AuditLogger(storage);
  const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({
        message: "Sess\xE3o expirada. Fa\xE7a login novamente.",
        code: "SESSION_EXPIRED"
      });
    }
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({
        message: "Acesso negado. Voc\xEA precisa ser administrador.",
        code: "ADMIN_REQUIRED"
      });
    }
    next();
  };
  app2.post("/api/upload", upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      const base64 = req.file.buffer.toString("base64");
      const dataUrl = `data:${req.file.mimetype};base64,${base64}`;
      await new Promise((resolve) => setTimeout(resolve, 500));
      res.json({
        url: dataUrl,
        filename: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Erro ao fazer upload da imagem" });
    }
  });
  app2.get("/api/products", async (req, res) => {
    try {
      const products2 = await storage.getProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });
  app2.get("/api/products/featured", async (req, res) => {
    try {
      const products2 = await storage.getFeaturedProducts();
      res.json(products2);
    } catch (error) {
      console.error("Error fetching featured products:", error);
      res.status(500).json({ message: "Failed to fetch featured products" });
    }
  });
  app2.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products2 = await storage.getProductsByCategory(category);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching products by category:", error);
      res.status(500).json({ message: "Failed to fetch products by category" });
    }
  });
  app2.get("/api/products/:id", async (req, res) => {
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
  app2.post("/api/products", isAdmin, async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(productData);
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
  app2.put("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const oldProduct = await storage.getProductById(id);
      const productData = insertProductSchema.partial().parse(req.body);
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
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
  app2.delete("/api/products/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const productToDelete = await storage.getProductById(id);
      const deleted = await storage.deleteProduct(id);
      if (!deleted) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (req.user?.id && productToDelete) {
        await auditLogger.logDelete("products", id, productToDelete, req.user.id, `Produto "${productToDelete.name}" deletado`);
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });
  app2.get("/api/categories", async (req, res) => {
    try {
      const categories2 = await storage.getCategories();
      res.json(categories2);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });
  app2.get("/api/categories/:id", async (req, res) => {
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
  app2.post("/api/categories", isAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const newCategory = await storage.createCategory(categoryData);
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
  app2.put("/api/categories/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }
      const oldCategory = await storage.getCategoryById(id);
      const categoryData = insertCategorySchema.partial().parse(req.body);
      const updatedCategory = await storage.updateCategory(id, categoryData);
      if (!updatedCategory) {
        return res.status(404).json({ message: "Category not found" });
      }
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
  app2.delete("/api/categories/:id", isAdmin, async (req, res) => {
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
  app2.get("/api/inventory/low-stock", isAdmin, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const products2 = await storage.getLowStockProducts(limit);
      res.json(products2);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });
  app2.get("/api/inventory/transactions", isAdmin, async (req, res) => {
    try {
      const productId = req.query.productId ? parseInt(req.query.productId) : void 0;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      if (req.query.productId && isNaN(productId)) {
        return res.status(400).json({ message: "Invalid product ID" });
      }
      const transactions = await storage.getInventoryTransactions(productId, limit);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching inventory transactions:", error);
      res.status(500).json({ message: "Failed to fetch inventory transactions" });
    }
  });
  app2.post("/api/inventory/update-stock", isAdmin, async (req, res) => {
    try {
      const { productId, stockChange, transactionType, notes } = req.body;
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
  app2.get("/api/cart/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const cart = await storage.getCart(sessionId);
      res.json(cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });
  app2.post("/api/cart", async (req, res) => {
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
  app2.put("/api/cart/:id", async (req, res) => {
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
  app2.delete("/api/cart/:id", async (req, res) => {
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
  app2.delete("/api/cart/clear/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      await storage.clearCart(sessionId);
      res.status(204).end();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });
  app2.post("/api/admin/reset-inventory", isAdmin, async (req, res) => {
    try {
      const { resetStock = true, clearSalesHistory = true } = req.body;
      if (resetStock) {
        await storage.updateProduct(1, { stock: 35 });
      }
      res.json({
        message: "Invent\xE1rio resetado com sucesso!",
        resetStock,
        clearSalesHistory,
        note: "Produto ID 1 resetado para estoque 35"
      });
    } catch (error) {
      console.error("Error resetting inventory:", error);
      res.status(500).json({ message: "Failed to reset inventory", error: error.message });
    }
  });
  app2.get("/api/brands", async (req, res) => {
    try {
      const brands2 = await storage.getBrands();
      res.json(brands2);
    } catch (error) {
      console.error("Error fetching brands:", error);
      res.status(500).json({ error: "Failed to fetch brands" });
    }
  });
  app2.get("/api/brands/:id", async (req, res) => {
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
  app2.post("/api/brands", isAdmin, async (req, res) => {
    try {
      const brand = await storage.createBrand(req.body);
      if (req.user?.id) {
        await auditLogger.logCreate("brands", brand.id, brand, req.user.id, `Marca "${brand.name}" criada`);
      }
      res.status(201).json(brand);
    } catch (error) {
      console.error("Error creating brand:", error);
      res.status(500).json({ error: "Failed to create brand" });
    }
  });
  app2.put("/api/brands/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const oldBrand = await storage.getBrandById(id);
      const brand = await storage.updateBrand(id, req.body);
      if (!brand) {
        return res.status(404).json({ error: "Brand not found" });
      }
      if (req.user?.id && oldBrand) {
        await auditLogger.logUpdate("brands", id, oldBrand, brand, req.user.id, `Marca "${brand.name}" atualizada`);
      }
      res.json(brand);
    } catch (error) {
      console.error("Error updating brand:", error);
      res.status(500).json({ error: "Failed to update brand" });
    }
  });
  app2.delete("/api/brands/:id", isAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const brandToDelete = await storage.getBrandById(id);
      const success = await storage.deleteBrand(id);
      if (!success) {
        return res.status(404).json({ error: "Brand not found" });
      }
      if (req.user?.id && brandToDelete) {
        await auditLogger.logDelete("brands", id, brandToDelete, req.user.id, `Marca "${brandToDelete.name}" deletada`);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting brand:", error);
      res.status(500).json({ error: "Failed to delete brand" });
    }
  });
  app2.get("/api/audit-logs", isAdmin, async (req, res) => {
    try {
      const tableName = req.query.table;
      const recordId = req.query.recordId ? parseInt(req.query.recordId) : void 0;
      const limit = req.query.limit ? parseInt(req.query.limit) : void 0;
      const logs = await storage.getAuditLogs(tableName, recordId, limit);
      res.json(logs);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      res.status(500).json({ error: "Failed to fetch audit logs" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use((req, res, next) => {
    if (req.originalUrl.startsWith("/api/")) {
      return next();
    }
    return vite.middlewares(req, res, next);
  });
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    if (url.startsWith("/api/")) {
      return next();
    }
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "..", "dist", "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
dotenv2.config();
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
