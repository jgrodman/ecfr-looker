import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface Agency {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
  cfr_references: {
    title: number;
    chapter: string;
  }[];
}

const db = new sqlite3.Database('./app.db');

const runAsync = promisify(db.run.bind(db));

export async function initializeDatabase() {
  try {
    await runAsync(`
      CREATE TABLE IF NOT EXISTS agencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        short_name TEXT,
        display_name TEXT,
        sortable_name TEXT,
        slug TEXT
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

export async function saveAgencies(agencies: Agency[]) {
  try {
    await initializeDatabase();
  } catch (error) {
    console.error('Error saving agencies:', error);
    throw error;
  }
}
