const path = require("path");
const express = require("express");

const { rootDir, siteUrl } = require("./config");
const { createSiteRouter } = require("./routes/site");
const { NAV_ITEMS, SITE_NAME, SITE_TAGLINE } = require("./lib/site");

function formatDate(dateValue) {
  const date = new Date(dateValue);

  return new Intl.DateTimeFormat("nb-NO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function buildCanonicalUrl(requestPath) {
  return new URL(requestPath, siteUrl).toString();
}

function createApp(repository) {
  const app = express();

  app.set("view engine", "ejs");
  app.set("views", path.join(rootDir, "views"));

  app.use(express.urlencoded({ extended: false }));
  app.use(express.static(path.join(rootDir, "public")));

  app.use((request, response, next) => {
    response.locals.navItems = NAV_ITEMS;
    response.locals.site = {
      name: SITE_NAME,
      tagline: SITE_TAGLINE,
    };
    response.locals.formatDate = formatDate;
    response.locals.currentYear = new Date().getFullYear();
    response.locals.currentPath = request.path;
    response.locals.canonicalUrl = buildCanonicalUrl(request.originalUrl || request.path);
    next();
  });

  app.use(createSiteRouter(repository));

  app.use((request, response) => {
    response.status(404).render("404", {
      pageTitle: "Fant ikke siden | FØNIKS",
      metaDescription: "Siden du prøvde å åpne finnes ikke.",
      activeNav: null,
    });
  });

  app.use((error, request, response, next) => {
    console.error(error);

    if (response.headersSent) {
      next(error);
      return;
    }

    response.status(500).render("500", {
      pageTitle: "Serverfeil | FØNIKS",
      metaDescription: "Noe gikk galt da siden skulle lastes.",
      activeNav: null,
    });
  });

  return app;
}

module.exports = {
  createApp,
};
