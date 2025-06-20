import dotenv from "dotenv";
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from "ws";
import { drizzle } from 'drizzle-orm/neon-serverless';
import * as schema from "@shared/schema";

dotenv.config();

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });