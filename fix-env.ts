import * as fs from "fs";

const envPath = require("path").join(process.cwd(), ".env");
let content = fs.readFileSync(envPath, "utf8");

// Fix DATABASE_URL: remove &options=endpoint=... param (causes SNI mismatch with pooler host)
content = content.replace(
  /&options=endpoint%3Dep-still-salad-b4y0kbzl"/g,
  '"'
);

// Fix DIRECT_URL: remove &channel_binding=require param (may break Prisma schema engine)
content = content.replace(
  /&channel_binding=require"/g,
  '"'
);

fs.writeFileSync(envPath, content);
console.log("Updated .env file");
