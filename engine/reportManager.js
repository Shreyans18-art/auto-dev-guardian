import fs from "fs";
import path from "path";

const REPORT_DIR = "./reports";
const REPORT_PATH = path.join(REPORT_DIR, "latest.json");

export function saveReport(data) {
  // 🔥 Step 1: Ensure folder exists
  if (!fs.existsSync(REPORT_DIR)) {
    fs.mkdirSync(REPORT_DIR, { recursive: true });
  }

  // 🔥 Step 2: Write file
  fs.writeFileSync(REPORT_PATH, JSON.stringify(data, null, 2));
}