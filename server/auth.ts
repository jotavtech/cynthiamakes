import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
// import connectPg from "connect-pg-simple";
// import { pool } from "./db";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

// Store de sessão usando MemoryStore temporariamente
// const PostgresSessionStore = connectPg(session);
// const sessionStore = new PostgresSessionStore({ 
//   pool, 
//   createTableIfMissing: true,
//   tableName: 'session'
// });

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || 'minha-chave-secreta-temporaria',
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 10, // 10 minutos para sessão admin
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username);
        
        // Verificar se a senha tem hash (contém '.')
        const isHashedPassword = user?.password?.includes('.');
        
        // Se for senha hash, use comparePasswords, caso contrário compare diretamente
        if (!user || (isHashedPassword && !(await comparePasswords(password, user.password))) || 
            (!isHashedPassword && password !== user.password)) {
          return done(null, false);
        } else {
          return done(null, user);
        }
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const existingUser = await storage.getUserByUsername(req.body.username);
      if (existingUser) {
        return res.status(400).json({ error: "Nome de usuário já existe" });
      }

      const user = await storage.createUser({
        ...req.body,
        password: await hashPassword(req.body.password),
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json(user);
      });
    } catch (error) {
      next(error);
    }
  });

  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json(req.user);
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      
      // Destruir completamente a sessão
      req.session.destroy((destroyErr) => {
        if (destroyErr) {
          console.error("Erro ao destruir sessão:", destroyErr);
          return next(destroyErr);
        }
        
        // Limpar cookie da sessão
        res.clearCookie('connect.sid');
        res.sendStatus(200);
      });
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });

  app.get("/api/admin/status", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ 
        authenticated: false, 
        message: "Sessão não encontrada" 
      });
    }
    
    if (!req.user.isAdmin) {
      return res.status(403).json({ 
        authenticated: true, 
        isAdmin: false, 
        message: "Usuário não é administrador" 
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