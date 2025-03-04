import sqlite3 from 'sqlite3';
import { runAsync } from '.';

export const db = new sqlite3.Database('./app.db');

export async function initializeDatabase() {
  try {
    await runAsync(
      `CREATE TABLE IF NOT EXISTS agencies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        short_name TEXT,
        display_name TEXT,
        sortable_name TEXT,
        slug TEXT
      )`,
    );

    await runAsync(
      `CREATE TABLE IF NOT EXISTS cfr_references (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        agency_id INTEGER,
        title INTEGER,
        chapter TEXT,
        FOREIGN KEY (agency_id) REFERENCES agencies (id)
      )`,
    );

    await runAsync('DELETE FROM cfr_references');
    await runAsync('DELETE FROM agencies');

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}
