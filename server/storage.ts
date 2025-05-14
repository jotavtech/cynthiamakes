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
  InsertInventoryTransaction
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
}

// Format price from cents to display format (R$ 00,00)
const formatPrice = (priceInCents: number): string => {
  return `R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}`;
};

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private cartItems: Map<number, CartItem>;
  private inventoryTransactions: Map<number, InventoryTransaction>;
  private currentUserId: number;
  private currentProductId: number;
  private currentCartItemId: number;
  private currentInventoryTransactionId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.cartItems = new Map();
    this.inventoryTransactions = new Map();
    this.currentUserId = 1;
    this.currentProductId = 1;
    this.currentCartItemId = 1;
    this.currentInventoryTransactionId = 1;
    
    // Create memory session store
    const MemoryStore = require('memorystore')(session);
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000 // prune expired entries every 24h
    });
    
    // Add admin user
    this.createUser({
      username: "admin",
      password: "admin123" // In a real app, this would be hashed
    }).then(user => {
      // Update admin status
      const adminUser = { ...user, isAdmin: true };
      this.users.set(user.id, adminUser);
    });
    
    // Add some initial products
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
      imageUrl: insertProduct.imageUrl,
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
    await this.createInventoryTransaction({
      productId: id,
      quantity: stockChange,
      type: transactionType,
      notes: notes || "",
      createdBy: userId
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
      createdAt: now
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

  // Seed initial products
  private async seedProducts() {
    const initialProducts: InsertProduct[] = [
      {
        name: "Base Líquida Ultra HD",
        description: "Base de alta cobertura com acabamento natural, ideal para peles normais a secas.",
        price: 8990, // R$ 89,90
        category: "face",
        brand: "Cynthia Beauty",
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
        brand: "Cynthia Beauty",
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
        brand: "Cynthia Beauty",
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
        brand: "Cynthia Beauty",
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
        brand: "Cynthia Beauty",
        imageUrl: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
        isNew: false,
        isFeatured: false
      },
      {
        name: "Iluminador Gold Glow",
        description: "Iluminador em pó com acabamento dourado que proporciona um brilho natural à pele.",
        price: 6990, // R$ 69,90
        category: "face",
        brand: "Cynthia Beauty",
        imageUrl: "https://images.unsplash.com/photo-1591375372156-542495912da9?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=500&q=80",
        isNew: true,
        isFeatured: false
      },
      {
        name: "Base Premium Gold",
        description: "Nossa base mais vendida, com cobertura média a alta e acabamento natural.",
        price: 11990, // R$ 119,90
        category: "face",
        brand: "Cynthia Beauty",
        imageUrl: "https://pixabay.com/get/g77746cb48f7952b6b4f637df5e2bfc1334981d9b98a82ae0d6b6c6c4f4b7aa4807a591c37f2df4c79bfe3e0445c7891935986d2707d6fe3d52a640ed4f4bd711_1280.jpg",
        isNew: false,
        isFeatured: true
      },
      {
        name: "Paleta de Sombras Sunset",
        description: "18 cores inspiradas no pôr do sol, altamente pigmentadas e fáceis de aplicar.",
        price: 14990, // R$ 149,90
        category: "eyes",
        brand: "Cynthia Beauty",
        imageUrl: "https://pixabay.com/get/gf0fb7fc1bd67bb986daaa8dd41eee373994a1ac67e01d761c3b0562ed52e8eb364f5d1ce1a466e58a2f3506436a3e79033d1e03b59fae40fb738c5fd69a86eb0_1280.jpg",
        isNew: false,
        isFeatured: true
      },
      {
        name: "Kit Completo para Lábios",
        description: "4 batons e 2 glosses em cores versáteis para todos os momentos.",
        price: 19990, // R$ 199,90
        category: "lips",
        brand: "Cynthia Beauty",
        imageUrl: "https://images.unsplash.com/photo-1594125311687-3b1b3eafa9f4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=400&q=80",
        isNew: false,
        isFeatured: true
      }
    ];
    
    for (const product of initialProducts) {
      await this.createProduct(product);
    }
  }
}

// Use o armazenamento baseado em banco de dados PostgreSQL
export const storage = new DatabaseStorage();
