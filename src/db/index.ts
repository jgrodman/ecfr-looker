import { db } from './init';

export * from './init';
export * from './agencies';

export function runAsync(
  sql: string,
  params: (string | number)[] = [],
): Promise<{ lastID: number }> {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (this: { lastID: number }, err: Error | null) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID });
    });
  });
}
