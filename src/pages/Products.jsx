import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllProducts, unwrapProductList } from '../api/productApi';
import ShopProductCard from '../components/ShopProductCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import {
  CATEGORY_OPTIONS,
  CATEGORY_SLUGS,
  matchesCategoryFilter,
} from '../utils/categories';
import { compareProductIdDesc, productId, productTitle } from '../utils/format';
import '../styles/Products.css';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Terbaru' },
  { value: 'price-asc', label: 'Harga terendah' },
  { value: 'price-desc', label: 'Harga tertinggi' },
  { value: 'name', label: 'Nama A–Z' },
];

function parsePriceInput(s) {
  if (s == null || String(s).trim() === '') return null;
  const n = Number(String(s).replace(/\s/g, '').replace(/\./g, ''));
  return Number.isFinite(n) ? n : null;
}

function AccordionSection({
  id,
  title,
  open,
  onToggle,
  children,
}) {
  return (
    <div className="filter-acc">
      <button
        type="button"
        className="filter-acc__head"
        aria-expanded={open}
        aria-controls={`filter-panel-${id}`}
        id={`filter-trigger-${id}`}
        onClick={onToggle}
      >
        <span>{title}</span>
        <span
          className={`filter-acc__chev${open ? ' filter-acc__chev--open' : ''}`}
          aria-hidden
        >
          ›
        </span>
      </button>
      {open && (
        <div
          className="filter-acc__panel"
          id={`filter-panel-${id}`}
          role="region"
          aria-labelledby={`filter-trigger-${id}`}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category') || CATEGORY_SLUGS.ALL;

  const [raw, setRaw] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');

  const [openSections, setOpenSections] = useState({
    category: true,
    price: true,
  });

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [sort, setSort] = useState('latest');
  const [view, setView] = useState('grid');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProducts();
        if (cancelled) return;
        setRaw(unwrapProductList(res));
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeCategory =
    CATEGORY_OPTIONS.some((o) => o.slug === categoryParam) ?
      categoryParam
    : CATEGORY_SLUGS.ALL;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const minP = parsePriceInput(priceMin);
    const maxP = parsePriceInput(priceMax);

    return raw.filter((p) => {
      if (!matchesCategoryFilter(p, activeCategory)) return false;

      if (q) {
        const title = productTitle(p).toLowerCase();
        const cat = String(p?.category ?? '').toLowerCase();
        if (!title.includes(q) && !cat.includes(q)) return false;
      }

      const price = Number(p?.price);
      if (minP != null && !Number.isNaN(price) && price < minP) return false;
      if (maxP != null && !Number.isNaN(price) && price > maxP) return false;

      return true;
    });
  }, [raw, activeCategory, query, priceMin, priceMax]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    switch (sort) {
      case 'price-asc':
        return list.sort((a, b) => Number(a.price) - Number(b.price));
      case 'price-desc':
        return list.sort((a, b) => Number(b.price) - Number(a.price));
      case 'name':
        return list.sort((a, b) =>
          productTitle(a).localeCompare(productTitle(b), 'id'),
        );
      case 'latest':
      default:
        return list.sort(compareProductIdDesc);
    }
  }, [filtered, sort]);

  function setCategory(slug) {
    const next = new URLSearchParams(searchParams);
    if (!slug || slug === CATEGORY_SLUGS.ALL) {
      next.delete('category');
    } else {
      next.set('category', slug);
    }
    setSearchParams(next, { replace: true });
  }

  function toggleSection(key) {
    setOpenSections((s) => ({ ...s, [key]: !s[key] }));
  }

  const total = sorted.length;
  const rangeLabel =
    total === 0 ? '0 produk' : (
      `Menampilkan 1–${total} dari ${total} hasil`
    );

  return (
    <main className="products-shop">
      <nav className="products-shop__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="products-shop__crumb">
          Toko
        </Link>
        <span className="products-shop__crumb-sep" aria-hidden="true">
          /
        </span>
        <span className="products-shop__crumb products-shop__crumb--current">
          Semua produk
        </span>
      </nav>

      {error && (
        <p className="products-page__error" role="alert">
          Tidak dapat memuat produk. Pastikan backend berjalan dan{' '}
          <code className="products-page__code">VITE_API_URL</code> benar.
        </p>
      )}

      <div className="products-shop__layout">
        <aside className="products-shop__sidebar" aria-label="Filter">
          <label className="products-shop__search">
            <span className="visually-hidden">Cari produk</span>
            <div className="products-shop__search-field">
              <span className="products-shop__search-icon" aria-hidden="true">
                <svg
                  className="products-shop__search-svg"
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                >
                  <path
                    fill="currentColor"
                    d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                  />
                </svg>
              </span>
              <input
                type="search"
                className="products-shop__search-input"
                placeholder="Cari produk…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
              />
            </div>
          </label>

          <AccordionSection
            id="cat"
            title="Kategori produk"
            open={openSections.category}
            onToggle={() => toggleSection('category')}
          >
            <ul className="filter-list">
              {CATEGORY_OPTIONS.map((opt) => {
                const selected = activeCategory === opt.slug;
                return (
                  <li key={opt.slug}>
                    <button
                      type="button"
                      className={`filter-list__btn${selected ? ' filter-list__btn--active' : ''}`}
                      onClick={() => setCategory(opt.slug)}
                    >
                      {opt.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </AccordionSection>

          <AccordionSection
            id="price"
            title="Filter harga"
            open={openSections.price}
            onToggle={() => toggleSection('price')}
          >
            <div className="filter-price">
              <label className="filter-price__field">
                <span>Minimum (Rp)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="filter-price__input"
                  placeholder="0"
                  value={priceMin}
                  onChange={(e) => setPriceMin(e.target.value)}
                />
              </label>
              <label className="filter-price__field">
                <span>Maksimum (Rp)</span>
                <input
                  type="text"
                  inputMode="numeric"
                  className="filter-price__input"
                  placeholder="∞"
                  value={priceMax}
                  onChange={(e) => setPriceMax(e.target.value)}
                />
              </label>
            </div>
          </AccordionSection>
        </aside>

        <div className="products-shop__main">
          <div className="products-shop__toolbar">
            <div className="products-shop__toolbar-left">
              <div
                className="products-shop__view"
                role="group"
                aria-label="Tampilan"
              >
                <button
                  type="button"
                  className={`products-shop__view-btn${view === 'grid' ? ' is-active' : ''}`}
                  onClick={() => setView('grid')}
                  aria-pressed={view === 'grid'}
                  aria-label="Tampilan grid"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M4 4h7v7H4V4zm9 0h7v7h-7V4zM4 13h7v7H4v-7zm9 0h7v7h-7v-7z"
                    />
                  </svg>
                </button>
                <button
                  type="button"
                  className={`products-shop__view-btn${view === 'list' ? ' is-active' : ''}`}
                  onClick={() => setView('list')}
                  aria-pressed={view === 'list'}
                  aria-label="Tampilan daftar"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden>
                    <path
                      fill="currentColor"
                      d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2z"
                    />
                  </svg>
                </button>
              </div>
              <p className="products-shop__count">{rangeLabel}</p>
            </div>

            <div className="products-shop__toolbar-right">
              <label className="products-shop__sort">
                <span className="visually-hidden">Urutkan</span>
                <span className="products-shop__sort-label">Urutkan</span>
                <select
                  className="products-shop__select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          {(loading || sorted.length > 0) && (
            <div
              className={
                view === 'list' ?
                  'products-shop__grid products-shop__grid--list'
                : 'products-shop__grid'
              }
            >
              {loading ?
                Array.from({ length: 9 }).map((_, i) => (
                  <SkeletonCard key={`sk-${i}`} variant="shop" />
                ))
              : sorted.map((p) => (
                  <ShopProductCard
                    key={productId(p)}
                    product={p}
                    view={view}
                  />
                ))}
            </div>
          )}

          {!loading && !error && sorted.length === 0 && (
            <div className="products-empty">
              <div className="products-empty__art" aria-hidden="true">
                <svg
                  className="products-empty__svg"
                  viewBox="0 0 200 160"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect
                    x="24"
                    y="40"
                    width="152"
                    height="96"
                    rx="12"
                    fill="#ffffff"
                    stroke="#1a1a2e"
                    strokeOpacity="0.12"
                  />
                  <path
                    d="M48 68h104M48 92h72M48 116h88"
                    stroke="#e94560"
                    strokeWidth="6"
                    strokeLinecap="round"
                    opacity="0.35"
                  />
                  <circle cx="148" cy="52" r="28" fill="#e94560" opacity="0.15" />
                  <circle cx="148" cy="52" r="14" fill="#e94560" opacity="0.5" />
                </svg>
              </div>
              <h2 className="products-empty__title">Belum ada yang cocok</h2>
              <p className="products-empty__text">
                Coba kata kunci lain atau longgarkan filter — kadang barang
                favoritmu cuma perlu sedikit jeda pencarian.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
