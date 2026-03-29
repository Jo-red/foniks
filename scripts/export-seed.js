const fs = require("fs/promises");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();

const databasePath = path.join(__dirname, "..", "data", "foniks.sqlite");
const seedPath = path.join(__dirname, "..", "data", "seed.json");

function openDatabase(filePath) {
  const database = new sqlite3.Database(filePath);

  return {
    all(sql, params = []) {
      return new Promise((resolve, reject) => {
        database.all(sql, params, (error, rows) => (error ? reject(error) : resolve(rows)));
      });
    },
    close() {
      return new Promise((resolve, reject) => {
        database.close((error) => (error ? reject(error) : resolve()));
      });
    },
  };
}

async function exportSeed() {
  const database = openDatabase(databasePath);

  try {
    const sections = await database.all(`
      SELECT slug, name, description, nav_order AS navOrder
      FROM sections
      ORDER BY nav_order ASC
    `);

    const sectionLinks = await database.all(`
      SELECT a.url, s.slug
      FROM article_sections links
      JOIN articles a ON a.id = links.article_id
      JOIN sections s ON s.id = links.section_id
      ORDER BY s.nav_order ASC, a.published_at DESC
    `);

    const sectionsByArticle = new Map();
    for (const row of sectionLinks) {
      const existing = sectionsByArticle.get(row.url) || [];
      existing.push(row.slug);
      sectionsByArticle.set(row.url, existing);
    }

    const articles = await database.all(`
      SELECT title, url, image_url AS imageUrl, kicker, excerpt, published_at AS publishedAt, recommended
      FROM articles
      ORDER BY published_at DESC
    `);

    const pages = await database.all(`
      SELECT slug, title, intro, image_url AS imageUrl, body_html AS bodyHtml, cta_label AS ctaLabel, cta_url AS ctaUrl
      FROM pages
      ORDER BY slug ASC
    `);

    const seed = {
      sections,
      articles: articles.map((article) => ({
        ...article,
        recommended: Boolean(article.recommended),
        sections: sectionsByArticle.get(article.url) || [],
      })),
      pages,
    };

    await fs.writeFile(seedPath, `${JSON.stringify(seed, null, 2)}\n`, "utf8");
    console.log(`Seed exported to ${seedPath}`);
  } finally {
    await database.close();
  }
}

exportSeed().catch((error) => {
  console.error("Failed to export seed data:", error);
  process.exit(1);
});
