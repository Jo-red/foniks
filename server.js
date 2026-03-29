const { port } = require("./src/config");
const { initializeDatabase } = require("./src/db");
const { createSiteRepository } = require("./src/repositories/site-repository");
const { createApp } = require("./src/app");

async function start() {
  const database = await initializeDatabase();
  const repository = createSiteRepository(database);
  const app = createApp(repository);

  const server = app.listen(port, () => {
    console.log(`FØNIKS is running at http://localhost:${port}`);
  });

  const shutdown = async () => {
    server.close(async () => {
      await database.close();
      process.exit(0);
    });
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((error) => {
  console.error("Failed to start FØNIKS:", error);
  process.exit(1);
});
