import pg from "pg";
import { readFileSync } from "fs";
import { join } from "path";

const sql = readFileSync(
  join("G:", "Mi unidad", "RR Aliados", "08_Dev", "Proyectos", "Altruismo", "supabase", "migrations", "001_initial.sql"),
  "utf-8"
);

const pool = new pg.Pool({
  host: "db.ntgtvtzbjwotuwkiflar.supabase.co",
  port: 5432,
  database: "postgres",
  user: "postgres",
  password: "Amoryverdad1209@",
  ssl: { rejectUnauthorized: false },
});

try {
  await pool.query(sql);
  console.log("Migration successful!");
} catch (err) {
  console.error("Migration failed:", err.message);
} finally {
  await pool.end();
}
