// FILE: lib/turso.ts

import { createClient } from '@libsql/client';

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// schema
async function initializeDB() {
  try {
    await client.execute(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      )
    `);
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id ON notes(user_id)
    `);
    
    await client.execute(`
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON notes(updated_at)
    `);
    
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

// Initialize
initializeDB();

export const db = client;
