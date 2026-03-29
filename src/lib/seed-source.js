const fs = require("fs/promises");

const { seedPath } = require("../config");

async function loadSeedContent() {
  const raw = await fs.readFile(seedPath, "utf8");
  return JSON.parse(raw);
}

module.exports = {
  loadSeedContent,
};
