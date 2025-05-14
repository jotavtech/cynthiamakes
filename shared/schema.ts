import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Store price in cents to avoid floating point issues
  category: text("category").notNull(),
  brand: text("brand").notNull(),
  imageUrl: text("image_url").notNull(),
  videoUrl: text("video_url").notNull().default(""), 
  isNew: boolean("is_new").default(false).notNull(),
  isFeatured: boolean("is_featured").default(false).notNull(),
  stock: integer("stock").default(0).notNull(), // Track inventory stock level
  lowStockThreshold: integer("low_stock_threshold").default(5).notNull(), // Threshold for low stock warning
  sku: text("sku").notNull().default(""), // Stock Keeping Unit for inventory tracking
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  sessionId: text("session_id").notNull(),
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
});

// Inventory transaction table for tracking stock changes
export const inventoryTransactions = pgTable("inventory_transactions", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(), // Positive for additions, negative for reductions
  type: text("type").notNull(), // Types: "purchase", "sale", "adjustment", "return"
  notes: text("notes").default(""),
  createdBy: integer("created_by").notNull(), // User ID who created the transaction
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInventoryTransactionSchema = createInsertSchema(inventoryTransactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type InventoryTransaction = typeof inventoryTransactions.$inferSelect;
export type InsertInventoryTransaction = z.infer<typeof insertInventoryTransactionSchema>;

// Extended Product type with formatted price for frontend
export type DisplayProduct = Product & {
  formattedPrice: string;
  stockStatus?: "in_stock" | "low_stock" | "out_of_stock";
};

// Cart with product details
export type CartItemWithProduct = CartItem & {
  product: DisplayProduct;
};
