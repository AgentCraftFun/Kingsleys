import Database from "better-sqlite3";
import path from "node:path";

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (_db) return _db;
  const dbPath = process.env.LAND_REGISTRY_DB_PATH
    ? path.resolve(process.env.LAND_REGISTRY_DB_PATH)
    : path.resolve(process.cwd(), "data", "land-registry.db");
  _db = new Database(dbPath, { readonly: true, fileMustExist: true });
  _db.pragma("journal_mode = WAL");
  return _db;
}

export type SaleRow = {
  transaction_id: string;
  price: number;
  date_of_transfer: string;
  postcode: string;
  postcode_district: string;
  postcode_sector: string;
  property_type: string;
  paon: string;
  saon: string;
  street: string;
  locality: string;
  town_city: string;
};
