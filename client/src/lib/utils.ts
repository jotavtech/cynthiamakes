import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate a random session ID for the cart
export function generateSessionId() {
  // Criar um ID mais consistente usando timestamp e random
  const timestamp = new Date().getTime();
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `cart_${timestamp}_${randomPart}`;
}

// Format price from cents to display format
export function formatPrice(priceInCents: number): string {
  return `R$ ${(priceInCents / 100).toFixed(2).replace('.', ',')}`;
}

// Parse price from display format to cents
export function parsePrice(priceDisplay: string): number {
  return Math.round(parseFloat(priceDisplay.replace(/[^\d,]/g, '').replace(',', '.')) * 100);
}

// Filter products by criteria
export function filterProducts(products: any[], filters: any) {
  return products.filter(product => {
    // Filter by category
    if (filters.categories.length > 0 && !filters.categories.includes(product.category)) {
      return false;
    }
    
    // Filter by price range
    const price = product.price;
    if (filters.priceRanges.length > 0) {
      const inPriceRange = filters.priceRanges.some((range: string) => {
        switch (range) {
          case 'under-50':
            return price < 5000;
          case '50-100':
            return price >= 5000 && price < 10000;
          case '100-200':
            return price >= 10000 && price < 20000;
          case 'over-200':
            return price >= 20000;
          default:
            return true;
        }
      });
      
      if (!inPriceRange) return false;
    }
    
    // Filter by brand
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) {
      return false;
    }
    
    return true;
  });
}

// Sort products
export function sortProducts(products: any[], sortOption: string) {
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case 'price-asc':
      sortedProducts.sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      sortedProducts.sort((a, b) => b.price - a.price);
      break;
    case 'newest':
      sortedProducts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    // Default is 'relevance', keep the original order
    default:
      break;
  }
  
  return sortedProducts;
}
