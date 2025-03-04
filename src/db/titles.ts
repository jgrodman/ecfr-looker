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
    console.log(`Saving ${titles.length} titles...`);

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
    [number, name, latest_amended_on, latest_issue_date, up_to_date_as_of, reserved ? 1 : 0],
  );
}

export async function saveChapterWordCount(args: {
  titleNumber: number;
  chapterName: string;
  wordCount: Record<string, number>;
  date: string;
}) {
  const { titleNumber, chapterName, wordCount, date } = args;
  console.log(`Saving chapter word count for title ${titleNumber}, chapter ${chapterName}`);

  await runAsync(
    `INSERT INTO title_chapter_word_counts (title_number, chapter_name, word_count, date)
       VALUES (?, ?, ?, ?)`,
    [titleNumber, chapterName, JSON.stringify(wordCount), date],
  );
}

async function initTables() {
  await runAsync('DROP TABLE IF EXISTS titles');
  await runAsync(
    `CREATE TABLE titles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            number INTEGER,
            name TEXT,
            latest_amended_on DATE,
            latest_issue_date DATE,
            up_to_date_as_of DATE,
            reserved BOOLEAN
          )`,
  );

  await runAsync('DROP TABLE IF EXISTS title_chapter_word_counts');
  await runAsync(
    `CREATE TABLE title_chapter_word_counts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title_number INTEGER,
            chapter_name TEXT,
            word_count TEXT,
            date DATE
          )`,
  );
}
