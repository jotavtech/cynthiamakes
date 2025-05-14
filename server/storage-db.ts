import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  CartItem, 
  InsertCartItem, 
  DisplayProduct, 
  CartItemWithProduct,
  users,
  products,
  cartItems
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import { formatPrice } from "@/lib/utils";
import { IStorage } from "./storage";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
      tableName: 'session'
    });
  }

  // Métodos de usuário
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Métodos de produto
  async getProducts(): Promise<DisplayProduct[]> {
    const allProducts = await db.select().from(products);
    return allProducts.map(this.formatProduct);
  }

  async getProductById(id: number): Promise<DisplayProduct | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product ? this.formatProduct(product) : undefined;
  }

  async getProductsByCategory(category: string): Promise<DisplayProduct[]> {
    const filteredProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, category));
    
    return filteredProducts.map(this.formatProduct);
  }

  async getFeaturedProducts(): Promise<DisplayProduct[]> {
    const featuredProducts = await db
      .select()
      .from(products)
      .where(eq(products.isFeatured, true))
      .limit(4);
    
    return featuredProducts.map(this.formatProduct);
  }

  async createProduct(insertProduct: InsertProduct): Promise<DisplayProduct> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    
    return this.formatProduct(product);
  }

  async updateProduct(id: number, updateData: Partial<InsertProduct>): Promise<DisplayProduct | undefined> {
    const [product] = await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, id))
      .returning();
    
    return product ? this.formatProduct(product) : undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning({ id: products.id });
    
    return result.length > 0;
  }

  // Métodos de carrinho
  async getCart(sessionId: string): Promise<CartItemWithProduct[]> {
    const items = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.sessionId, sessionId));

    const result: CartItemWithProduct[] = [];

    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      
      if (product) {
        result.push({
          ...item,
          product: this.formatProduct(product)
        });
      }
    }

    return result;
  }

  async addToCart(insertItem: InsertCartItem): Promise<CartItem> {
    // Verifica se o produto já está no carrinho
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.productId, insertItem.productId),
          eq(cartItems.sessionId, insertItem.sessionId)
        )
      );

    if (existingItem) {
      // Atualiza a quantidade se o item já existir
      const newQuantity = existingItem.quantity + insertItem.quantity;
      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();
      
      return updatedItem;
    }

    // Caso contrário, insere um novo item
    const [newItem] = await db
      .insert(cartItems)
      .values(insertItem)
      .returning();
    
    return newItem;
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    
    return updatedItem;
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.id, id))
      .returning({ id: cartItems.id });
    
    return result.length > 0;
  }

  async clearCart(sessionId: string): Promise<boolean> {
    const result = await db
      .delete(cartItems)
      .where(eq(cartItems.sessionId, sessionId))
      .returning({ id: cartItems.id });
    
    return result.length > 0;
  }

  // Métodos auxiliares
  private formatProduct(product: Product): DisplayProduct {
    return {
      ...product,
      formattedPrice: formatPrice(product.price)
    };
  }
}