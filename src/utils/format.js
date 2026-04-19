export function formatRupiah(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return 'Rp—';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function getRatingValue(rating) {
  if (rating == null) return 0;
  if (typeof rating === 'number') return rating;
  if (typeof rating === 'object' && typeof rating.rate === 'number') return rating.rate;
  return 0;
}

export function getRatingCount(rating) {
  if (rating == null) return null;
  if (typeof rating === 'object' && typeof rating.count === 'number') return rating.count;
  return null;
}

/**
 * ID untuk routing & `GET /products/:id` — prioritas short id dari backend,
 * lalu `id`, `_id`, dll.
 */
export function productId(p) {
  if (!p || typeof p !== 'object') return '';
  const v =
    p.shortId ??
    p.short_id ??
    p.id ??
    p._id ??
    p.productId ??
    p.product_id;
  if (v == null || v === '') return '';
  return String(v);
}

/** Urutan "terbaru": id numerik jika bisa, selain itu perbandingan string id */
export function compareProductIdDesc(a, b) {
  const sa = productId(a);
  const sb = productId(b);
  const na = Number(sa);
  const nb = Number(sb);
  if (sa && sb && !Number.isNaN(na) && !Number.isNaN(nb)) return nb - na;
  return sb.localeCompare(sa);
}

export function productTitle(p) {
  return p?.title ?? p?.name ?? 'Produk';
}

export function productImage(p) {
  return p?.image ?? p?.images?.[0] ?? '';
}

/** Daftar URL gambar untuk galeri — mendukung `images: []` atau satu `image` */
export function productImages(p) {
  if (Array.isArray(p?.images) && p.images.length > 0) {
    return p.images.map((u) => String(u)).filter(Boolean);
  }
  const one = productImage(p);
  return one ? [one] : [];
}

export function productStock(p) {
  if (p?.stock != null) return Number(p.stock);
  return null;
}

/** Brand / vendor — fallback dari kata pertama judul jika API tidak mengirim */
export function productBrand(p) {
  const b = p?.brand ?? p?.vendor;
  if (b && String(b).trim()) return String(b).trim();
  const title = productTitle(p);
  const first = title.split(/\s+/)[0];
  return first && first.length > 2 ? first : 'MarketIn';
}

/** Harga coret (sebelum diskon) jika ada di API */
export function productOriginalPrice(p) {
  const v = p?.originalPrice ?? p?.compareAtPrice ?? p?.oldPrice ?? p?.price_before;
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isNaN(n) ? null : n;
}
