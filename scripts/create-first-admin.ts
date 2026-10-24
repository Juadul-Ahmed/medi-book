
import "dotenv/config";

import { createInterface } from "node:readline/promises";
import { stdin, stdout } from "node:process";
import { auth } from "../src/lib/auth";
import { prisma } from "../src/lib/prisma";

function askHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!stdin.isTTY || typeof stdin.setRawMode !== "function") {
      reject(new Error("Run this script in an interactive terminal."));
      return;
    }

    stdout.write(question);
    let value = "";

    const onData = (chunk: Buffer) => {
      const char = chunk.toString("utf8");

      if (char === "\u0003") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        reject(new Error("Cancelled."));
        return;
      }

      if (char === "\r" || char === "\n") {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.removeListener("data", onData);
        stdout.write("\n");
        resolve(value);
        return;
      }

      if (char === "\u007f" || char === "\b") {
        value = value.slice(0, -1);
        return;
      }

      value += char;
    };

    stdin.setRawMode(true);
    stdin.resume();
    stdin.on("data", onData);
  });
}

async function main() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true, email: true },
  });

  if (existingAdmin) {
    throw new Error(
      `An administrator already exists (${existingAdmin.email}). Refusing to create another.`,
    );
  }

  const rl = createInterface({ input: stdin, output: stdout });

  let name: string;
  let email: string;

  try {
    name = (await rl.question("Administrator name: ")).trim();
    email = (await rl.question("Administrator email: "))
      .trim()
      .toLowerCase();
  } finally {
    rl.close();
  }

  if (!name || !email || !email.includes("@")) {
    throw new Error("Enter a valid name and email address.");
  }

  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error(
      "An account with this email already exists. No changes were made.",
    );
  }

  const password = await askHidden("Password (minimum 12 characters): ");
  const confirmation = await askHidden("Confirm password: ");

  if (password.length < 12) {
    throw new Error("The password must contain at least 12 characters.");
  }

  if (password !== confirmation) {
    throw new Error("Passwords do not match.");
  }

  const result = await auth.api.signUpEmail({
    body: { name, email, password },
  });

  await prisma.user.update({
    where: { id: result.user.id },
    data: { role: "ADMIN" },
  });

  console.log("\nFirst administrator created successfully.");
  console.log(`Email: ${email}`);
  console.log("Role: ADMIN");
}

main()
  .catch((error: unknown) => {
    console.error(
      "\nFailed to create administrator:",
      error instanceof Error ? error.message : error,
    );
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
