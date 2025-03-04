import { runAsync } from '.';

export interface Agency {
  name: string;
  short_name: string;
  display_name: string;
  sortable_name: string;
  slug: string;
  children: Agency[];
  cfr_references: { title: number; chapter: string }[];
}

export async function saveAgencies(agencies: Agency[]) {
  try {
    await initTables();
    console.log(`Starting to save ${agencies.length} agencies...`);

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
