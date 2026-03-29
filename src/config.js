const path = require("path");

const rootDir = path.resolve(__dirname, "..");

module.exports = {
  rootDir,
  dataDir: path.join(rootDir, "data"),
  dbPath: path.join(rootDir, "data", "foniks.sqlite"),
  seedPath: path.join(rootDir, "data", "seed.json"),
  port: Number(process.env.PORT || 3000),
  siteUrl: process.env.SITE_URL || "http://localhost:3000",
};
