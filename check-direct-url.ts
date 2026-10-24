import * as dotenv from "dotenv";

dotenv.config();

const directUrl = process.env.DIRECT_URL!;
const u = new URL(directUrl);

console.log("Host:", u.hostname);
console.log("Protocol:", u.protocol);
console.log("Params:", [...u.searchParams].map(([k]) => k));
console.log("Has endpoint option:", u.searchParams.has("options"));
if (u.searchParams.has("options")) {
  console.log("Options value:", u.searchParams.get("options"));
}
console.log("Hostname contains -pooler:", u.hostname.includes("-pooler"));
