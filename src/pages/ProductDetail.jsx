import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { addCartItem } from '../api/cartApi.js';
import { getProductById } from '../api/productApi';
import { useAuth } from '../hooks/useAuth.js';
import {
  formatRupiah,
  getRatingCount,
  getRatingValue,
  productBrand,
  productId,
  productImages,
  productOriginalPrice,
  productStock,
  productTitle,
} from '../utils/format';
import '../styles/ProductDetail.css';

function StarRow({ value }) {
  const n = Math.min(5, Math.max(0, Math.round(Number(value))));
  const chars = Array.from({ length: 5 }, (_, i) => (i < n ? '★' : '☆'));
  return (
    <span className="pd-stars" title={`${Number(value).toFixed(1)} dari 5`}>
      {chars.join('')}
    </span>
  );
}

function normalizeColorOptions(product) {
  const raw = product?.colors ?? product?.colorOptions;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map((item, i) => {
    if (typeof item === 'string') {
      return { key: `${item}-${i}`, label: item, hex: '#6b6b7b' };
    }
    return {
      key: String(item.value ?? item.id ?? item.name ?? i),
      label: String(item.label ?? item.name ?? item.value ?? '—'),
      hex: item.hex ?? item.color ?? '#6b6b7b',
    };
  });
}

function normalizeSizes(product) {
  const raw = product?.sizes ?? product?.sizeOptions;
  if (!Array.isArray(raw) || raw.length === 0) return [];
  return raw.map(String);
}

function ProductDetailLoaded({ product }) {
  const { user, ready } = useAuth();
  const images = useMemo(() => productImages(product), [product]);
  const colors = useMemo(() => normalizeColorOptions(product), [product]);
  const sizes = useMemo(() => normalizeSizes(product), [product]);

  const [activeImg, setActiveImg] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [sizePick, setSizePick] = useState(null);
  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  const activeSize = sizePick ?? sizes[0] ?? null;
  const shortId = productId(product);

  const title = productTitle(product);
  const brand = productBrand(product);
  const price = product?.price;
  const original = productOriginalPrice(product);
  const showOld =
    original != null && Number(original) > Number(price || 0);
  const ratingVal = getRatingValue(product?.rating);
  const ratingCount = getRatingCount(product?.rating);
  const stock = productStock(product);
  const inStock = stock == null || Number.isNaN(stock) || stock > 0;
  const mainSrc = images[activeImg] ?? '';

  const maxQty =
    stock != null && !Number.isNaN(stock) && stock > 0 ? Math.min(99, stock) : 99;

  async function handleAddToCart() {
    if (!ready || !shortId) return;
    if (!user) {
      window.alert('Harap login terlebih dahulu');
      return;
    }
    setAdding(true);
    try {
      await addCartItem(shortId, qty);
      window.dispatchEvent(new Event('cart:updated'));
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal menambahkan ke keranjang.';
      window.alert(typeof msg === 'string' ? msg : 'Gagal menambahkan ke keranjang.');
    } finally {
      setAdding(false);
    }
  }

  return (
    <main className="pd">
      <nav className="pd__breadcrumb" aria-label="Breadcrumb">
        <Link to="/" className="pd__crumb">
          Beranda
        </Link>
        <span className="pd__crumb-sep">/</span>
        <Link to="/products" className="pd__crumb">
          Produk
        </Link>
        <span className="pd__crumb-sep">/</span>
        <span className="pd__crumb pd__crumb--current">{title}</span>
      </nav>

      <div className="pd__top">
        <div className="pd__gallery">
          <div className="pd__main-frame">
            {mainSrc ?
              <img
                src={mainSrc}
                alt={title}
                className="pd__main-img"
              />
            : <div className="pd__main-img pd__main-img--empty" />}
          </div>
          {images.length > 1 && (
            <div className="pd__thumbs" role="list">
              {images.map((src, i) => (
                <button
                  key={`${src}-${i}`}
                  type="button"
                  role="listitem"
                  className={`pd__thumb${i === activeImg ? ' pd__thumb--active' : ''}`}
                  onClick={() => setActiveImg(i)}
                  aria-label={`Gambar ${i + 1}`}
                  aria-pressed={i === activeImg}
                >
                  <img src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="pd__buy">
          <span
            className={`pd__stock-badge${inStock ? ' pd__stock-badge--ok' : ' pd__stock-badge--no'}`}
          >
            {inStock ? 'Tersedia' : 'Habis'}
          </span>

          <p className="pd__brand">{brand}</p>
          <h1 className="pd__title">{title}</h1>

          <div className="pd__rating-row">
            <StarRow value={ratingVal} />
            <span className="pd__rating-num">{ratingVal.toFixed(1)}</span>
            {ratingCount != null && (
              <span className="pd__rating-meta">({ratingCount} ulasan)</span>
            )}
          </div>

          <div className="pd__price-row">
            <span className="pd__price">{formatRupiah(price)}</span>
            {showOld && (
              <span className="pd__price-old">{formatRupiah(original)}</span>
            )}
          </div>

          {colors.length > 0 && (
            <div className="pd__pick">
              <span className="pd__pick-label">Warna</span>
              <div className="pd__swatches">
                {colors.map((c, i) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`pd__swatch${i === colorIdx ? ' pd__swatch--active' : ''}`}
                    style={{ '--swatch': c.hex }}
                    title={c.label}
                    onClick={() => setColorIdx(i)}
                    aria-label={c.label}
                    aria-pressed={i === colorIdx}
                  />
                ))}
              </div>
            </div>
          )}

          {sizes.length > 0 && (
            <div className="pd__pick">
              <span className="pd__pick-label">Ukuran</span>
              <div className="pd__sizes">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`pd__size${activeSize === s ? ' pd__size--active' : ''}`}
                    onClick={() => setSizePick(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pd__actions">
            <div className="pd__qty" aria-label="Jumlah">
              <button
                type="button"
                className="pd__qty-btn"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                aria-label="Kurangi"
              >
                −
              </button>
              <span className="pd__qty-val">{qty}</span>
              <button
                type="button"
                className="pd__qty-btn"
                onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                disabled={!inStock}
                aria-label="Tambah"
              >
                +
              </button>
            </div>
            <button
              type="button"
              className="pd__btn-cart"
              onClick={handleAddToCart}
              disabled={!inStock || adding}
            >
              {adding ? 'Menambahkan…' : 'Tambah ke Keranjang'}
            </button>
            <button
              type="button"
              className="pd__btn-wish"
              aria-label="Tambah ke wishlist"
            >
              <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
                <path
                  fill="currentColor"
                  d="M16.5 3c-1.74 0-3.41.81-4.5 2.09C10.91 3.81 9.24 3 7.5 3 4.42 3 2 5.42 2 8.5c0 3.78 3.4 6.86 8.55 11.54L12 21.35l1.45-1.32C18.6 15.36 22 12.28 22 8.5 22 5.42 19.58 3 16.5 3zm-4.4 15.55l-.1.1-.1-.1C7.14 14.24 4 11.39 4 8.5 4 6.5 5.5 5 7.5 5c1.54 0 3.04.99 3.57 2.36h1.87C13.46 5.99 14.96 5 16.5 5c2 0 3.5 1.5 3.5 3.5 0 2.89-3.14 5.74-7.9 10.05z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <section
        className="pd__desc-section"
        aria-labelledby="pd-desc-heading"
      >
        <h2 id="pd-desc-heading" className="pd__desc-heading">
          Deskripsi
        </h2>
        <p className="pd__desc-text">
          {product?.description ?? 'Belum ada deskripsi untuk produk ini.'}
        </p>
      </section>
    </main>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getProductById(id);
        if (cancelled) return;
        const payload = res?.data;
        const item =
          payload?.data ?? payload?.product ??
          (payload && typeof payload === 'object' && !Array.isArray(payload) ?
            payload
          : null);
        setProduct(item);
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <main className="pd">
        <div className="pd__shell pd__shell--loading">
          <div className="pd__sk pd__sk--img" />
          <div className="pd__sk-col">
            <div className="pd__sk pd__sk--line lg" />
            <div className="pd__sk pd__sk--line sm" />
            <div className="pd__sk pd__sk--line md" />
            <div className="pd__sk pd__sk--line full" />
            <div className="pd__sk pd__sk--line full" />
          </div>
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="pd pd--center">
        <p className="pd__error" role="alert">
          Produk tidak ditemukan atau gagal dimuat.
        </p>
        <Link to="/products" className="pd__link-back">
          ← Kembali ke daftar
        </Link>
      </main>
    );
  }

  return <ProductDetailLoaded key={id} product={product} />;
}
