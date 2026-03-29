const express = require("express");

function asyncHandler(handler) {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

function renderListing(response, payload, activeNav) {
  response.render("listing", {
    pageTitle: `${payload.heading} | FØNIKS`,
    metaDescription: payload.intro,
    activeNav,
    heading: payload.heading,
    intro: payload.intro,
    featured: payload.featured,
    articles: payload.articles,
  });
}

function createSiteRouter(repository) {
  const router = express.Router();

  router.get("/index.html", (request, response) => response.redirect(301, "/"));
  router.get("/about-us", (request, response) => response.redirect(301, "/about"));
  router.get("/about/index.html", (request, response) => response.redirect(301, "/about"));
  router.get("/about-us/index.html", (request, response) => response.redirect(301, "/about"));
  router.get("/latest/index.html", (request, response) => response.redirect(301, "/latest"));
  router.get("/support/index.html", (request, response) => response.redirect(301, "/support"));
  router.get("/donate/index.html", (request, response) => response.redirect(301, "/support"));
  router.get("/tag/opinion", (request, response) => response.redirect(301, "/opinion"));
  router.get("/tag/opinion/index.html", (request, response) => response.redirect(301, "/opinion"));
  router.get("/tag/breaking-news", (request, response) => response.redirect(301, "/news"));
  router.get("/tag/breaking-news/index.html", (request, response) => response.redirect(301, "/news"));
  router.get("/tag/satire", (request, response) => response.redirect(301, "/culture"));
  router.get("/tag/satire/index.html", (request, response) => response.redirect(301, "/culture"));
  router.get("/tag/review-recommends", (request, response) => response.redirect(301, "/recommended"));
  router.get("/tag/review-recommends/index.html", (request, response) => response.redirect(301, "/recommended"));

  router.get(
    "/",
    asyncHandler(async (request, response) => {
      const snapshot = await repository.getHomepageSnapshot();

      response.render("home", {
        pageTitle: "FØNIKS",
        metaDescription: "Et komponentisert redaksjonelt nettsted for ideer, kultur og konservativ kritikk.",
        activeNav: "home",
        ...snapshot,
      });
    }),
  );

  router.get(
    "/latest",
    asyncHandler(async (request, response) => {
      const listing = await repository.getLatestListing();
      renderListing(response, listing, "latest");
    }),
  );

  router.get(
    "/opinion",
    asyncHandler(async (request, response) => {
      const listing = await repository.getSectionListing("opinion");
      renderListing(response, listing, "opinion");
    }),
  );

  router.get(
    "/news",
    asyncHandler(async (request, response) => {
      const listing = await repository.getSectionListing("news");
      renderListing(response, listing, "news");
    }),
  );

  router.get(
    "/culture",
    asyncHandler(async (request, response) => {
      const listing = await repository.getSectionListing("culture");
      renderListing(response, listing, "culture");
    }),
  );

  router.get(
    "/recommended",
    asyncHandler(async (request, response) => {
      const listing = await repository.getSectionListing("recommended");
      renderListing(response, listing, "recommended");
    }),
  );

  router.get(
    "/about",
    asyncHandler(async (request, response) => {
      const page = await repository.getPageContent("about");
      const highlights = await repository.getSupportHighlights();

      response.render("page", {
        pageTitle: "Om FØNIKS",
        metaDescription: page.intro,
        activeNav: "about",
        page,
        highlights,
      });
    }),
  );

  router.get(
    "/support",
    asyncHandler(async (request, response) => {
      const page = await repository.getPageContent("support");
      const highlights = await repository.getSupportHighlights();

      response.render("page", {
        pageTitle: "Støtt FØNIKS",
        metaDescription: page.intro,
        activeNav: "support",
        page,
        highlights,
      });
    }),
  );

  router.get("/donate", (request, response) => {
    response.redirect(301, "/support");
  });

  router.get(
    "/search",
    asyncHandler(async (request, response) => {
      const query = typeof request.query.q === "string" ? request.query.q.trim() : "";
      const results = await repository.search(query);

      response.render("search", {
        pageTitle: query ? `Søk: ${query} | FØNIKS` : "Søk | FØNIKS",
        metaDescription: query
          ? `Søkeresultater for ${query} på FØNIKS.`
          : "Søk i FØNIKS-arkivet.",
        activeNav: null,
        query,
        results,
      });
    }),
  );

  return router;
}

module.exports = {
  createSiteRouter,
};
