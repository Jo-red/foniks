const { getSectionDefinition, SECTION_DEFINITIONS } = require("../lib/site");

function mapArticle(row) {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    imageUrl: row.image_url,
    kicker: row.kicker,
    excerpt: row.excerpt,
    publishedAt: row.published_at,
    recommended: Boolean(row.recommended),
  };
}

function mapSection(row) {
  const definition = getSectionDefinition(row.slug);

  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    href: definition ? definition.href : `/${row.slug}`,
  };
}

function createSiteRepository(database) {
  async function getRecentArticles(limit = 12) {
    const rows = await database.all(
      `
        SELECT id, title, url, image_url, kicker, excerpt, published_at, recommended
        FROM articles
        ORDER BY datetime(published_at) DESC
        LIMIT ?
      `,
      [limit],
    );

    return rows.map(mapArticle);
  }

  async function getSectionBySlug(slug) {
    const row = await database.get(
      `
        SELECT slug, name, description
        FROM sections
        WHERE slug = ?
      `,
      [slug],
    );

    return row ? mapSection(row) : null;
  }

  async function getArticlesBySection(slug, limit = 12) {
    const rows = await database.all(
      `
        SELECT a.id, a.title, a.url, a.image_url, a.kicker, a.excerpt, a.published_at, a.recommended
        FROM articles a
        JOIN article_sections links ON links.article_id = a.id
        JOIN sections s ON s.id = links.section_id
        WHERE s.slug = ?
        ORDER BY datetime(a.published_at) DESC
        LIMIT ?
      `,
      [slug, limit],
    );

    return rows.map(mapArticle);
  }

  async function getPage(slug) {
    return database.get(
      `
        SELECT slug, title, intro, image_url, body_html, cta_label, cta_url
        FROM pages
        WHERE slug = ?
      `,
      [slug],
    );
  }

  async function searchArticles(query, limit = 24) {
    if (!query) {
      return [];
    }

    const needle = `%${query}%`;
    const rows = await database.all(
      `
        SELECT id, title, url, image_url, kicker, excerpt, published_at, recommended
        FROM articles
        WHERE title LIKE ? OR excerpt LIKE ? OR kicker LIKE ?
        ORDER BY datetime(published_at) DESC
        LIMIT ?
      `,
      [needle, needle, needle, limit],
    );

    return rows.map(mapArticle);
  }

  return {
    async getHomepageSnapshot() {
      const recent = await getRecentArticles(16);
      const heroCenter = recent[0] || null;
      const heroLeft = recent.slice(1, 3);
      const heroRight = recent.slice(3, 8);
      const sectionBlocks = [];

      for (const section of SECTION_DEFINITIONS) {
        const meta = await getSectionBySlug(section.slug);
        const articles = await getArticlesBySection(section.slug, 4);
        sectionBlocks.push({ section: meta, articles });
      }

      return {
        heroCenter,
        heroLeft,
        heroRight,
        sectionBlocks,
      };
    },

    async getLatestListing() {
      const articles = await getRecentArticles(18);

      return {
        heading: "Siste",
        intro: "De nyeste tekstene fra FØNIKS, samlet i én oversikt.",
        featured: articles[0] || null,
        articles,
      };
    },

    async getSectionListing(slug) {
      const section = await getSectionBySlug(slug);

      if (!section) {
        return null;
      }

      const articles = await getArticlesBySection(slug, 18);

      return {
        section,
        heading: section.name,
        intro: section.description,
        featured: articles[0] || null,
        articles,
      };
    },

    async getPageContent(slug) {
      return getPage(slug);
    },

    async getSupportHighlights() {
      return {
        recent: await getRecentArticles(3),
      };
    },

    async search(query) {
      return searchArticles(query);
    },
  };
}

module.exports = {
  createSiteRepository,
};
