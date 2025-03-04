import { runAsync } from '.';

export interface Title {
  number: number;
  name: string;
  latest_amended_on: string;
  latest_issue_date: string;
  up_to_date_as_of: string;
  reserved: boolean;
}

export async function saveTitles(titles: Title[]) {
  try {
    await initTables();
    console.log(`Starting to save ${titles.length} titles...`);

    for (const title of titles) {
      await saveTitle(title);
    }

    console.log('Successfully saved all titles to database');
  } catch (error) {
    console.error('Error saving titles:', error);
    throw error;
  }
}

async function saveTitle(title: Title) {
  const { number, name, latest_amended_on, latest_issue_date, up_to_date_as_of, reserved } = title;

  await runAsync(
    `INSERT INTO titles (number, name, latest_amended_on, latest_issue_date, up_to_date_as_of, reserved)
       VALUES (?, ?, ?, ?, ?, ?)`,
    [number, name, latest_amended_on, latest_issue_date, up_to_date_as_of, reserved],
  );
}

async function initTables() {
  await runAsync(
    `CREATE TABLE IF NOT EXISTS titles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number INTEGER,
            name TEXT,
            latest_amended_on TEXT,
            latest_issue_date TEXT,
            up_to_date_as_of TEXT,
            reserved BOOLEAN
          )`,
  );
  await runAsync('DELETE FROM titles');
}
