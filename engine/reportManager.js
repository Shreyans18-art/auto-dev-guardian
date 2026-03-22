import fs from "fs";

const REPORT_PATH = "./reports/latest.json";

export function saveReport(data) {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(data, null, 2));
}