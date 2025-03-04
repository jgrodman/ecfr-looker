import { runAsync, db } from '.';

export interface Agency {
  id: number;
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
  cfr_references: { title: number; chapter: string }[];
}

export interface AgencyWithWordCount extends Agency {
  total_word_count: number;
}

export interface WordCount {
  word: string;
  count: number;
}

export interface CfrReference {
  title: number | null;
  chapter: string | null;
}

type AgencyRow = {
  id: number;
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
};

export async function saveAgencies(agencies: Agency[]) {
  try {
    await initTables();
    console.log(`Saving ${agencies.length} agencies...`);

    for (const agency of agencies) {
      await saveAgency(agency);
    }

    console.log('Successfully saved all agencies to database');
  } catch (error) {
    console.error('Error saving agencies:', error);
    throw error;
  }
}

async function saveAgency(agency: Agency) {
  const { name, short_name, display_name, sortable_name, slug, children, cfr_references } = agency;

  try {
    const result = await runAsync(
      `INSERT INTO agencies (name, short_name, display_name, sortable_name, slug)
         VALUES (?, ?, ?, ?, ?)`,
      [name, short_name, display_name, sortable_name, slug],
    );

    const agencyId = result.lastID;

    if (cfr_references && cfr_references.length > 0) {
      for (const ref of cfr_references) {
        await runAsync(
          `INSERT INTO cfr_references (agency_id, title, chapter)
             VALUES (?, ?, ?)`,
          [agencyId, ref.title, ref.chapter],
        );
      }
    }

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

async function initTables() {
  await runAsync('DROP TABLE IF EXISTS cfr_references');
  await runAsync('DROP TABLE IF EXISTS agencies');

  await runAsync(
    `CREATE TABLE agencies (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          short_name TEXT,
          display_name TEXT,
          sortable_name TEXT,
          slug TEXT
        )`,
  );

  await runAsync(
    `CREATE TABLE cfr_references (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          agency_id INTEGER,
          title INTEGER,
          chapter TEXT,
          FOREIGN KEY (agency_id) REFERENCES agencies (id)
        )`,
  );
}

export async function getAllAgencies(): Promise<Agency[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT id, name, short_name, display_name, sortable_name, slug 
       FROM agencies 
       ORDER BY sortable_name`,
      (err: Error | null, rows: AgencyRow[]) => {
        if (err) resolve([]);
        else resolve(rows as Agency[]);
      },
    );
  });
}

export async function getAgenciesWithWordCounts(): Promise<AgencyWithWordCount[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `WITH agency_chapters AS (
        SELECT 
          a.id, 
          a.name, 
          a.short_name, 
          a.display_name, 
          a.sortable_name, 
          a.slug,
          json_group_array(
            json_object(
              'title', cr.title,
              'chapter', cr.chapter
            )
          ) as cfr_references,
          cr.title as ref_title, 
          cr.chapter as ref_chapter
        FROM agencies a
        LEFT JOIN cfr_references cr ON a.id = cr.agency_id
        GROUP BY a.id, a.name, a.short_name, a.display_name, a.sortable_name, a.slug
      ),
      agency_word_counts AS (
        SELECT 
          ac.*,
          tcwc.word_count
        FROM agency_chapters ac
        LEFT JOIN title_chapter_word_counts tcwc 
        ON ac.ref_title = tcwc.title_number 
        AND ac.ref_chapter = tcwc.chapter_name
      ),
      total_counts AS (
        SELECT 
          id,
          name,
          short_name,
          display_name,
          sortable_name,
          slug,
          cfr_references,
          COALESCE(
            SUM(
              (SELECT COALESCE(SUM(CAST(value AS INTEGER)), 0)
               FROM json_each(word_count)
              )
            ),
            0
          ) as total_word_count
        FROM agency_word_counts
        GROUP BY id, name, short_name, display_name, sortable_name, slug, cfr_references
      )
      SELECT * FROM total_counts
      ORDER BY sortable_name`,
      (
        err: Error | null,
        rows: (AgencyRow & { total_word_count: number; cfr_references: string })[],
      ) => {
        if (err) resolve([]);
        else {
          // Parse the JSON string of CFR references for each agency
          const agenciesWithParsedRefs = rows.map((row) => ({
            ...row,
            cfr_references: JSON.parse(row.cfr_references)
              .filter((ref: CfrReference) => ref.title !== null)
              .map((ref: CfrReference) => ({
                title: ref.title as number,
                chapter: ref.chapter as string,
              })),
          }));
          resolve(agenciesWithParsedRefs as AgencyWithWordCount[]);
        }
      },
    );
  });
}

export async function getAgencyWordCounts(agencyId: number): Promise<WordCount[]> {
  return new Promise((resolve, reject) => {
    db.all(
      `WITH agency_chapters AS (
        SELECT cr.title, cr.chapter
        FROM agencies a
        JOIN cfr_references cr ON a.id = cr.agency_id
        WHERE a.id = ?
      ),
      chapter_words AS (
        SELECT 
          word.key as word,
          CAST(word.value AS INTEGER) as count
        FROM agency_chapters ac
        JOIN title_chapter_word_counts tcwc 
          ON ac.title = tcwc.title_number 
          AND ac.chapter = tcwc.chapter_name
        JOIN json_each(tcwc.word_count) word
      ),
      word_totals AS (
        SELECT 
          word,
          SUM(count) as total_count
        FROM chapter_words
        GROUP BY word
      )
      SELECT word, total_count as count
      FROM word_totals
      ORDER BY total_count DESC
      LIMIT 50`,
      [agencyId],
      (err: Error | null, rows: WordCount[]) => {
        if (err) resolve([]);
        else resolve(rows);
      },
    );
  });
}

export async function getAgencyById(agencyId: number): Promise<Agency | null> {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT name, short_name, display_name, sortable_name, slug 
       FROM agencies 
       WHERE id = ?`,
      [agencyId],
      (err: Error | null, row: AgencyRow | undefined) => {
        if (err) resolve(null);
        else resolve(row ? (row as Agency) : null);
      },
    );
  });
}
