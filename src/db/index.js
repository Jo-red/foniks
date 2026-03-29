const fs = require("fs/promises");
const sqlite3 = require("sqlite3").verbose();

const { dataDir, dbPath } = require("../config");
const { loadSeedContent } = require("../lib/seed-source");

function openDatabase(filePath) {
  const raw = new sqlite3.Database(filePath);

  return {
    raw,
    exec(sql) {
      return new Promise((resolve, reject) => {
        raw.exec(sql, (error) => (error ? reject(error) : resolve()));
      });
    },
    run(sql, params = []) {
      return new Promise((resolve, reject) => {
        raw.run(sql, params, function onRun(error) {
          if (error) {
            reject(error);
            return;
          }

          resolve({
            lastID: this.lastID,
            changes: this.changes,
          });
        });
      });
    },
    get(sql, params = []) {
      return new Promise((resolve, reject) => {
        raw.get(sql, params, (error, row) => (error ? reject(error) : resolve(row)));
      });
    },
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        raw.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows)));
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        raw.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

async function ensureSchema(database) {
  await database.exec(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS sections (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      nav_order INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS articles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      url TEXT NOT NULL UNIQUE,
      image_url TEXT NOT NULL,
      kicker TEXT,
      excerpt TEXT,
      published_at TEXT NOT NULL,
      recommended INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS article_sections (
      article_id INTEGER NOT NULL,
      section_id INTEGER NOT NULL,
      PRIMARY KEY (article_id, section_id),
      FOREIGN KEY (article_id) REFERENCES articles(id) ON DELETE CASCADE,
      FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS pages (
      slug TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      intro TEXT NOT NULL,
      image_url TEXT NOT NULL,
      body_html TEXT NOT NULL,
      cta_label TEXT NOT NULL,
      cta_url TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
    CREATE INDEX IF NOT EXISTS idx_sections_nav_order ON sections(nav_order ASC);
  `);
}

async function seedDatabase(database) {
  const seed = await loadSeedContent();
  const sectionIds = new Map();

  await database.exec("BEGIN TRANSACTION");

  try {
    await database.exec(`
      DELETE FROM article_sections;
      DELETE FROM articles;
      DELETE FROM sections;
      DELETE FROM pages;
    `);

    for (const section of seed.sections) {
      const inserted = await database.run(
        `
          INSERT INTO sections (slug, name, description, nav_order)
          VALUES (?, ?, ?, ?)
        `,
        [section.slug, section.name, section.description, section.navOrder],
      );

      sectionIds.set(section.slug, inserted.lastID);
    }

    for (const article of seed.articles) {
      const inserted = await database.run(
        `
          INSERT INTO articles (title, url, image_url, kicker, excerpt, published_at, recommended)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [
          article.title,
          article.url,
          article.imageUrl,
          article.kicker || "",
          article.excerpt || "",
          article.publishedAt,
          article.recommended ? 1 : 0,
        ],
      );

      for (const sectionSlug of article.sections) {
        const sectionId = sectionIds.get(sectionSlug);

        if (!sectionId) {
          continue;
        }

        await database.run(
          `
            INSERT INTO article_sections (article_id, section_id)
            VALUES (?, ?)
          `,
          [inserted.lastID, sectionId],
        );
      }
    }

    for (const page of seed.pages) {
      await database.run(
        `
          INSERT INTO pages (slug, title, intro, image_url, body_html, cta_label, cta_url)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        [page.slug, page.title, page.intro, page.imageUrl, page.bodyHtml, page.ctaLabel, page.ctaUrl],
      );
    }

    await database.exec("COMMIT");
  } catch (error) {
    await database.exec("ROLLBACK");
    throw error;
  }
}

async function initializeDatabase({ force = false } = {}) {
  await fs.mkdir(dataDir, { recursive: true });

  const database = openDatabase(dbPath);
  await ensureSchema(database);

  const existing = await database.get("SELECT COUNT(*) AS count FROM articles");

  if (force || !existing || existing.count === 0) {
    await seedDatabase(database);
  }

  return database;
}

module.exports = {
  initializeDatabase,
};
