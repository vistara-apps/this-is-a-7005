import sqlite3 from 'sqlite3';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database connection
let db;

export function getDatabase() {
  if (!db) {
    const dbPath = process.env.DATABASE_URL || path.join(__dirname, '../database.sqlite');
    db = new sqlite3.Database(dbPath);
    
    // Promisify database methods
    db.runAsync = promisify(db.run.bind(db));
    db.getAsync = promisify(db.get.bind(db));
    db.allAsync = promisify(db.all.bind(db));
  }
  return db;
}

export async function initializeDatabase() {
  const database = getDatabase();
  
  try {
    // Create users table
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        userId TEXT PRIMARY KEY,
        email TEXT,
        walletAddress TEXT,
        paymentHistory TEXT DEFAULT '[]',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create token_deployments table
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS token_deployments (
        deploymentId TEXT PRIMARY KEY,
        userId TEXT,
        tokenName TEXT NOT NULL,
        tokenSymbol TEXT NOT NULL,
        totalSupply TEXT NOT NULL,
        decimals INTEGER NOT NULL DEFAULT 18,
        contractAddress TEXT,
        transactionHash TEXT,
        deploymentTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        status TEXT DEFAULT 'pending',
        paymentIntentId TEXT,
        gasUsed TEXT,
        gasCost TEXT,
        verificationStatus TEXT DEFAULT 'pending',
        baseScanUrl TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (userId)
      )
    `);

    // Create payment_sessions table
    await database.runAsync(`
      CREATE TABLE IF NOT EXISTS payment_sessions (
        sessionId TEXT PRIMARY KEY,
        userId TEXT,
        deploymentId TEXT,
        stripePaymentIntentId TEXT,
        amount INTEGER NOT NULL,
        currency TEXT DEFAULT 'usd',
        status TEXT DEFAULT 'pending',
        paymentMethod TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (userId),
        FOREIGN KEY (deploymentId) REFERENCES token_deployments (deploymentId)
      )
    `);

    // Create indexes for better performance
    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_deployments_user ON token_deployments (userId)
    `);
    
    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_deployments_status ON token_deployments (status)
    `);
    
    await database.runAsync(`
      CREATE INDEX IF NOT EXISTS idx_payments_user ON payment_sessions (userId)
    `);

    console.log('✅ Database tables created successfully');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export async function closeDatabase() {
  if (db) {
    return new Promise((resolve, reject) => {
      db.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
