const { initializeDatabase } = require("../src/db");
const { dbPath } = require("../src/config");

async function main() {
  const force = process.argv.includes("--force");
  const database = await initializeDatabase({ force });
  await database.close();
  console.log(`Database ready at ${dbPath}`);
}

main().catch((error) => {
  console.error("Failed to initialize the database:", error);
  process.exit(1);
});
