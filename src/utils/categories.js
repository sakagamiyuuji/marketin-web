/** Slug query ?category=xxx — matches Indonesian labels */
export const CATEGORY_SLUGS = {
  ALL: 'semua',
  ELEKTRONIK: 'elektronik',
  FASHION: 'fashion',
  MAKANAN: 'makanan',
  LAINNYA: 'lainnya',
};

export const CATEGORY_OPTIONS = [
  { slug: CATEGORY_SLUGS.ALL, label: 'Semua' },
  { slug: CATEGORY_SLUGS.ELEKTRONIK, label: 'Elektronik' },
  { slug: CATEGORY_SLUGS.FASHION, label: 'Fashion' },
  { slug: CATEGORY_SLUGS.MAKANAN, label: 'Makanan' },
  { slug: CATEGORY_SLUGS.LAINNYA, label: 'Lainnya' },
];

export const HOME_CATEGORIES = [
  {
    slug: CATEGORY_SLUGS.ELEKTRONIK,
    title: 'Elektronik',
    blurb: 'Gadget & aksesoris',
  },
  {
    slug: CATEGORY_SLUGS.FASHION,
    title: 'Fashion',
    blurb: 'Gaya sehari-hari',
  },
  {
    slug: CATEGORY_SLUGS.MAKANAN,
    title: 'Makanan',
    blurb: 'Camilan & kebutuhan dapur',
  },
  {
    slug: CATEGORY_SLUGS.LAINNYA,
    title: 'Lainnya',
    blurb: 'Temukan kejutan lain',
  },
];

const NORMALIZE = {
  elektronik: CATEGORY_SLUGS.ELEKTRONIK,
  electronics: CATEGORY_SLUGS.ELEKTRONIK,
  electronic: CATEGORY_SLUGS.ELEKTRONIK,
  fashion: CATEGORY_SLUGS.FASHION,
  "men's clothing": CATEGORY_SLUGS.FASHION,
  "women's clothing": CATEGORY_SLUGS.FASHION,
  jewelery: CATEGORY_SLUGS.FASHION,
  jewelry: CATEGORY_SLUGS.FASHION,
  makanan: CATEGORY_SLUGS.MAKANAN,
  food: CATEGORY_SLUGS.MAKANAN,
  lainnya: CATEGORY_SLUGS.LAINNYA,
  other: CATEGORY_SLUGS.LAINNYA,
  others: CATEGORY_SLUGS.LAINNYA,
  miscellaneous: CATEGORY_SLUGS.LAINNYA,
};

/**
 * Maps raw API category string to one of our slugs.
 */
export function productCategorySlug(raw) {
  if (raw == null || String(raw).trim() === '') return CATEGORY_SLUGS.LAINNYA;
  const key = String(raw).trim().toLowerCase();
  return NORMALIZE[key] ?? key;
}

export function matchesCategoryFilter(product, filterSlug) {
  if (!filterSlug || filterSlug === CATEGORY_SLUGS.ALL) return true;
  return productCategorySlug(product.category) === filterSlug;
}
