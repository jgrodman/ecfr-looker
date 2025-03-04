import sqlite3 from 'sqlite3';
import { promisify } from 'util';

export interface Agency {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
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

    await runAsync(`
      CREATE TABLE IF NOT EXISTS cfr_references (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_id INTEGER,
        title INTEGER,
        chapter TEXT,
        FOREIGN KEY (agency_id) REFERENCES agencies (id)
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

async function saveAgency(agency: Agency) {
  const { name, short_name, display_name, sortable_name, slug, children } = agency;

  try {
    await runAsync(
      `INSERT INTO agencies (name, short_name, display_name, sortable_name, slug)
       VALUES (?, ?, ?, ?, ?)`,
      // @ts-expect-error: sqlite3 can accept params as second argument
      [name, short_name, display_name, sortable_name, slug],
    );

    if (children && children.length > 0) {
      for (const child of children) {
        await saveAgency(child);
      }
    }
  } catch (error) {
    console.error(`Error saving agency ${name}:`, error);
    throw error;
  }
}

export async function saveAgencies(agencies: Agency[]) {
  try {
    // Initialize database first
    await initializeDatabase();

    // Clear existing data
    await runAsync('DELETE FROM cfr_references');
    await runAsync('DELETE FROM agencies');

    console.log(`Starting to save ${agencies.length} agencies...`);

    // Save all agencies
    for (const agency of agencies) {
      await saveAgency(agency);
    }

    console.log('Successfully saved all agencies to database');
  } catch (error) {
    console.error('Error saving agencies:', error);
    throw error;
  }
}
