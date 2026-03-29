const SITE_NAME = "FØNIKS";
const SITE_TAGLINE = "Ideer, kultur og konservativ kritikk.";

const SECTION_DEFINITIONS = [
  {
    slug: "opinion",
    name: "Mening",
    description: "Kommentarer, essays og politiske perspektiver.",
    href: "/opinion",
  },
  {
    slug: "news",
    name: "Nyheter",
    description: "Rapportering, analyse og offentlig debatt.",
    href: "/news",
  },
  {
    slug: "culture",
    name: "Kultur",
    description: "Kulturkritikk, idéhistorie og lengre refleksjoner.",
    href: "/culture",
  },
  {
    slug: "recommended",
    name: "Anbefalt",
    description: "Redaksjonens utvalgte tekster fra arkivet.",
    href: "/recommended",
  },
];

const NAV_ITEMS = [
  { id: "home", label: "Forside", href: "/" },
  { id: "latest", label: "Siste", href: "/latest" },
  ...SECTION_DEFINITIONS.map((section) => ({
    id: section.slug,
    label: section.name,
    href: section.href,
  })),
  { id: "about", label: "Om", href: "/about" },
  { id: "support", label: "Støtt", href: "/support" },
];

function getSectionDefinition(slug) {
  return SECTION_DEFINITIONS.find((section) => section.slug === slug) || null;
}

module.exports = {
  SITE_NAME,
  SITE_TAGLINE,
  SECTION_DEFINITIONS,
  NAV_ITEMS,
  getSectionDefinition,
};
