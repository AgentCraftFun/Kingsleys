import Database from "better-sqlite3";
import { createReadStream, existsSync } from "node:fs";
import { createInterface } from "node:readline";
import path from "node:path";

const DATA_DIR = path.resolve(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "land-registry.db");

const CSV_FILES = ["pp-2024.csv", "pp-2025.csv", "pp-monthly.csv"];

const TARGET_DISTRICTS = new Set([
  "NW11", "NW4", "NW3", "NW2", "NW1", "NW5", "NW6", "NW7", "NW8", "NW9", "NW10",
  "N6",
]);

function stripQuotes(s: string): string {
  if (s.startsWith('"') && s.endsWith('"')) return s.slice(1, -1);
  return s;
}

function parseRow(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      inQuote = !inQuote;
      cur += ch;
    } else if (ch === "," && !inQuote) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map(stripQuotes);
}

function getDistrict(postcode: string): string | null {
  if (!postcode) return null;
  const m = postcode.trim().toUpperCase().match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s+/);
  return m ? m[1] : null;
}

function getSector(postcode: string): string | null {
  if (!postcode) return null;
  const clean = postcode.trim().toUpperCase();
  const m = clean.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)\s+(\d)/);
  return m ? `${m[1]} ${m[2]}` : null;
}

async function importFile(db: Database.Database, file: string): Promise<number> {
  const full = path.join(DATA_DIR, file);
  if (!existsSync(full)) {
    console.warn(`skip (missing): ${file}`);
    return 0;
  }
  const insert = db.prepare(
    `INSERT OR REPLACE INTO sales
     (transaction_id, price, date_of_transfer, postcode, postcode_district, postcode_sector,
      property_type, old_or_new, duration, paon, saon, street, locality, town_city, district, county,
      ppd_category_type, record_status)
     VALUES (@transaction_id, @price, @date_of_transfer, @postcode, @postcode_district, @postcode_sector,
      @property_type, @old_or_new, @duration, @paon, @saon, @street, @locality, @town_city, @district, @county,
      @ppd_category_type, @record_status)`
  );

  const stream = createReadStream(full, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  let kept = 0;
  let seen = 0;
  const batch: Record<string, unknown>[] = [];

  const tx = db.transaction((rows: Record<string, unknown>[]) => {
    for (const r of rows) insert.run(r);
  });

  for await (const line of rl) {
    if (!line) continue;
    seen++;
    const cols = parseRow(line);
    if (cols.length < 16) continue;
    const postcode = cols[3];
    const district = getDistrict(postcode);
    if (!district || !TARGET_DISTRICTS.has(district)) continue;
    const sector = getSector(postcode);

    batch.push({
      transaction_id: cols[0],
      price: parseInt(cols[1], 10) || 0,
      date_of_transfer: cols[2].slice(0, 10),
      postcode,
      postcode_district: district,
      postcode_sector: sector,
      property_type: cols[4],
      old_or_new: cols[5],
      duration: cols[6],
      paon: cols[7],
      saon: cols[8],
      street: cols[9],
      locality: cols[10],
      town_city: cols[11],
      district: cols[12],
      county: cols[13],
      ppd_category_type: cols[14],
      record_status: cols[15] ?? "",
    });
    kept++;

    if (batch.length >= 500) {
      tx(batch.splice(0, batch.length));
    }
  }
  if (batch.length) tx(batch);

  console.log(`  ${file}: kept ${kept} / ${seen} rows`);
  return kept;
}

async function main() {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("synchronous = NORMAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      transaction_id TEXT PRIMARY KEY,
      price INTEGER NOT NULL,
      date_of_transfer TEXT NOT NULL,
      postcode TEXT,
      postcode_district TEXT,
      postcode_sector TEXT,
      property_type TEXT,
      old_or_new TEXT,
      duration TEXT,
      paon TEXT,
      saon TEXT,
      street TEXT,
      locality TEXT,
      town_city TEXT,
      district TEXT,
      county TEXT,
      ppd_category_type TEXT,
      record_status TEXT
    );
    CREATE INDEX IF NOT EXISTS idx_sales_sector_type_date ON sales (postcode_sector, property_type, date_of_transfer DESC);
    CREATE INDEX IF NOT EXISTS idx_sales_district_type_date ON sales (postcode_district, property_type, date_of_transfer DESC);
    CREATE INDEX IF NOT EXISTS idx_sales_postcode ON sales (postcode);
  `);

  let total = 0;
  for (const f of CSV_FILES) {
    total += await importFile(db, f);
  }

  const count = db.prepare("SELECT COUNT(*) AS n FROM sales").get() as { n: number };
  console.log(`\nTotal rows in DB: ${count.n}`);

  const byDistrict = db
    .prepare(
      "SELECT postcode_district, COUNT(*) AS n FROM sales GROUP BY postcode_district ORDER BY n DESC"
    )
    .all() as { postcode_district: string; n: number }[];
  console.log("\nBy district:");
  for (const r of byDistrict) {
    console.log(`  ${r.postcode_district}: ${r.n}`);
  }

  db.close();
  console.log(`\nImport complete: ${total} rows`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
