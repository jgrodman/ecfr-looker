import sqlite3 from 'sqlite3';

export const dbRead = new sqlite3.Database('./app.db', sqlite3.OPEN_READONLY);
const dbWrite = new sqlite3.Database('./app.db');
export * from './agencies';

export function runAsync(
  sql: string,
  params: (string | number)[] = [],
): Promise<{ lastID: number }> {
  return new Promise((resolve, reject) => {
    dbWrite.run(sql, params, function (this: { lastID: number }, err: Error | null) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}
