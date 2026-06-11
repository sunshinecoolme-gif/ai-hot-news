import bcrypt from "bcryptjs";

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run admin:password -- "your-password"');
  process.exit(1);
}

async function main() {
  const hash = await bcrypt.hash(password, 12);

  console.log(hash);
}

void main();
