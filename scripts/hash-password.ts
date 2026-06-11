import bcrypt from "bcryptjs";

async function readPassword() {
  if (process.argv[2]) {
    console.error("Refusing to read a password from command arguments. Pipe it through stdin instead.");
    console.error("Usage: printf '%s' 'your-password' | npm run admin:password");
    process.exit(1);
  }

  if (process.stdin.isTTY) {
    console.error("Usage: printf '%s' 'your-password' | npm run admin:password");
    process.exit(1);
  }

  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }

  const password = Buffer.concat(chunks).toString("utf8").trim();
  if (!password) {
    console.error("Password cannot be empty.");
    process.exit(1);
  }

  return password;
}

async function main() {
  const password = await readPassword();
  const hash = await bcrypt.hash(password, 12);

  console.log(hash);
}

void main();
