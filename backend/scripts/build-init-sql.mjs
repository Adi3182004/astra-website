import fs from "fs";
import path from "path";

const dir = "backend/supabase/migrations";
const files = fs.readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();

let fullSchema = "";
for (const file of files) {
  fullSchema += `\n-- ==================== ${file} ====================\n`;
  fullSchema += fs.readFileSync(path.join(dir, file), "utf-8");
  fullSchema += "\n";
}

fs.writeFileSync("backend/supabase/full_schema.sql", fullSchema, "utf-8");

const seedData = fs.readFileSync("backend/supabase/seed_data.sql", "utf-8");
const initAll = fullSchema + "\n" + seedData;

fs.writeFileSync("backend/supabase/init_all.sql", initAll, "utf-8");
console.log("init_all.sql generated successfully with UTF-8 encoding. Size:", initAll.length);
