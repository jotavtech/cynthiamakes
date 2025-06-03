import { 
  User, 
  InsertUser, 
  Product, 
  InsertProduct, 
  CartItem, 
  InsertCartItem, 
  DisplayProduct, 
  CartItemWithProduct,
  InventoryTransaction,
  InsertInventoryTransaction,
  Category,
  InsertCategory,
  users,
  products,
  categories,
  cartItems,
  inventoryTransactions
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
    // Usar PostgreSQL store para sessões
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

  // Métodos de categoria
  async getCategories(): Promise<Category[]> {
    const allCategories = await db.select().from(categories);
    return allCategories;
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    
    return category;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(categories.id, id))
      .returning();
    
    return category;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({ id: categories.id });
    
    return result.length > 0;
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

  // Métodos de inventário
  async updateProductStock(
    id: number, 
    stockChange: number, 
    userId: number, 
    transactionType: string, 
    notes?: string
  ): Promise<DisplayProduct | undefined> {
    // Primeiro, obtém o produto atual
    const [product] = await db.select().from(products).where(eq(products.id, id));
    
    if (!product) return undefined;
    
    // Calcula o novo estoque (não permitindo valores negativos)
    const newStock = Math.max(0, product.stock + stockChange);
    
    // Atualiza o produto com o novo estoque
    const [updatedProduct] = await db
      .update(products)
      .set({ stock: newStock })
      .where(eq(products.id, id))
      .returning();
      
    if (!updatedProduct) return undefined;
    
    // Registra a transação de estoque
    await this.createInventoryTransaction({
      type: transactionType,
      productId: id,
      quantity: stockChange,
      createdBy: userId,
      notes: notes || null
    });
    
    // Retorna o produto atualizado com formato
    return this.formatProduct(updatedProduct);
  }
  
  async getProductStock(id: number): Promise<number> {
    const [product] = await db.select({ stock: products.stock }).from(products).where(eq(products.id, id));
    return product ? product.stock : 0;
  }
  
  async getLowStockProducts(limit: number = 20): Promise<DisplayProduct[]> {
    // Busca produtos que têm estoque baixo ou zerado
    const lowStockProducts = await db
      .select()
      .from(products)
      .where(
        // Não podemos usar operadores diretamente entre colunas na drizzle
        // Vamos buscar todos os produtos e filtrar na aplicação
        eq(products.id, products.id)
      )
      .limit(limit);
    
    // Filtrar produtos com estoque baixo ou zerado
    const filteredProducts = lowStockProducts.filter(product => 
      product.stock === 0 || product.stock <= product.lowStockThreshold
    );
    
    // Formatamos os produtos e adicionamos o status de estoque
    return filteredProducts.map(product => {
      const formattedProduct = this.formatProduct(product);
      
      // Adiciona o status de estoque
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
  
  async getInventoryTransactions(productId?: number, limit: number = 20): Promise<InventoryTransaction[]> {
    // Se um productId foi especificado, filtramos por ele
    if (productId) {
      const transactions = await db
        .select()
        .from(inventoryTransactions)
        .where(eq(inventoryTransactions.productId, productId))
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(limit);
      return transactions;
    } else {
      // Caso contrário, retorna todas as transações
      const transactions = await db
        .select()
        .from(inventoryTransactions)
        .orderBy(desc(inventoryTransactions.createdAt))
        .limit(limit);
      return transactions;
    }
  }
  
  async createInventoryTransaction(transaction: InsertInventoryTransaction): Promise<InventoryTransaction> {
    const [newTransaction] = await db
      .insert(inventoryTransactions)
      .values({
        ...transaction,
        createdAt: new Date()
      })
      .returning();
      
    return newTransaction;
  }

  // Métodos auxiliares
  private formatProduct(product: Product): DisplayProduct {
    const stockStatus = 
      product.stock === 0 ? "out_of_stock" :
      product.stock <= product.lowStockThreshold ? "low_stock" : 
      "in_stock";
      
    return {
      ...product,
      formattedPrice: formatPrice(product.price),
      stockStatus
    };
  }
}