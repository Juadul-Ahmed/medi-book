import * as fs from "fs";

const envPath = require("path").join(process.cwd(), ".env");
const content = fs.readFileSync(envPath, "utf8");
const lines = content.split("\n");

for (const line of lines) {
  if (line.startsWith("DATABASE_URL=") || line.startsWith("DIRECT_URL=")) {
    const key = line.split("=")[0];
    const value = line.substring(key.length + 1);
    console.log(`${key}: length=${value.length}, starts_with=${value.substring(0, 20)}..., ends_with=${value.substring(value.length - 30)}`);
    console.log(`  Has quotes: ${value.startsWith('"') && value.endsWith('"')}`);
    console.log(`  Params: ${value.substring(value.indexOf("?"))}`);
  }
}
