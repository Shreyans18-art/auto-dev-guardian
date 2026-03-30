import fs from "fs";
import path from "path";

const REPORT_PATH = path.resolve("./reports/latest.json");

// Ensure reports folder exists
function ensureDir() {
  if (!fs.existsSync("./reports")) {
    fs.mkdirSync("./reports", { recursive: true });
  }
}

// Save report (overwrite mode)
export function saveReport(report) {
  ensureDir();

  fs.writeFileSync(
    REPORT_PATH,
    JSON.stringify(report, null, 2)
  );
}

// Read report (used by GitHub bot later)
export function readReport() {
  if (!fs.existsSync(REPORT_PATH)) return null;

  return JSON.parse(
    fs.readFileSync(REPORT_PATH, "utf-8")
  );
}