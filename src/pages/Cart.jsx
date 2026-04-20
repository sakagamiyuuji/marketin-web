import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Link,
  Navigate,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import {
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from '../api/cartApi.js';
import { useAuth } from '../hooks/useAuth.js';
import {
  formatRupiah,
  productImage,
  productStock,
  productTitle,
} from '../utils/format.js';
import '../styles/Cart.css';

const DELIVERY_FEE = Number(import.meta.env.VITE_DELIVERY_FEE ?? 15000);

function categoryLabel(cat) {
  if (cat == null) return null;
  if (typeof cat === 'string') return cat.trim() || null;
  if (typeof cat === 'object') {
    const n = cat.name ?? cat.slug ?? cat.title ?? cat.label;
    if (n != null && String(n).trim()) return String(n).trim();
  }
  return null;
}

export default function Cart() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, ready } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyLine, setBusyLine] = useState(/** @type {string | null} */ (null));

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const res = await getCart();
      setCart(res.data ?? {});
    } catch (err) {
      if (err.response?.status === 401) {
        navigate('/login', {
          replace: true,
          state: { from: location.pathname },
        });
        return;
      }
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Tidak dapat memuat keranjang.';
      setError(typeof msg === 'string' ? msg : 'Terjadi kesalahan.');
      setCart({ items: [], subtotal: 0, itemCount: 0 });
    }
  }, [navigate, location.pathname]);

  useEffect(() => {
    if (!ready || !user) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        await refresh();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, user, refresh]);

  const items = Array.isArray(cart?.items) ? cart.items : [];
  const subtotal = Number(cart?.subtotal ?? 0);
  const grandTotal = subtotal + DELIVERY_FEE;

  const stockCap = useCallback((product) => {
    const s = productStock(product);
    if (s == null || Number.isNaN(s)) return Infinity;
    return Math.max(0, Number(s));
  }, []);

  async function patchQty(shortId, nextQty) {
    setBusyLine(shortId);
    setError(null);
    try {
      if (nextQty < 1) {
        await removeCartItem(shortId);
      } else {
        await updateCartItem(shortId, nextQty);
      }
      await refresh();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Stok atau jumlah tidak valid.';
      setError(typeof msg === 'string' ? msg : 'Gagal memperbarui item.');
      await refresh();
    } finally {
      setBusyLine(null);
      window.dispatchEvent(new Event('cart:updated'));
    }
  }

  async function handleClear() {
    if (!items.length) return;
    if (!window.confirm('Kosongkan semua item di keranjang?')) return;
    setBusyLine('__all__');
    setError(null);
    try {
      await clearCart();
      await refresh();
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Gagal mengosongkan keranjang.';
      setError(typeof msg === 'string' ? msg : 'Terjadi kesalahan.');
    } finally {
      setBusyLine(null);
      window.dispatchEvent(new Event('cart:updated'));
    }
  }

  const summaryRows = useMemo(
    () => [
      { key: 'sub', label: 'Subtotal', value: subtotal },
      { key: 'ship', label: 'Ongkos kirim', value: DELIVERY_FEE },
    ],
    [subtotal],
  );

  if (!ready) {
    return (
      <main className="cart-page">
        <div className="cart-page__inner cart-page__inner--center">
          <p className="cart-page__muted">Memuat…</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" replace state={{ from: location.pathname }} />
    );
  }

  return (
    <main className="cart-page">
      <div className="cart-page__inner">
        <header className="cart-page__head">
          <h1 className="cart-page__title">Keranjang</h1>
          {items.length > 0 ?
            <button
              type="button"
              className="cart-page__clear"
              onClick={handleClear}
              disabled={busyLine != null}
            >
              Kosongkan keranjang
            </button>
          : null}
        </header>

        {error ?
          <p className="cart-page__banner-error" role="alert">
            {error}
          </p>
        : null}

        {loading ?
          <p className="cart-page__muted">Memuat keranjang…</p>
        : null}

        {!loading && items.length === 0 ?
          <div className="cart-page__empty">
            <p>Keranjang kamu masih kosong.</p>
            <Link to="/products" className="cart-page__btn">
              Jelajahi produk
            </Link>
          </div>
        : null}

        {!loading && items.length > 0 ?
          <div className="cart-page__grid">
            <section className="cart-page__main" aria-label="Item keranjang">
              <div className="cart-table-wrap">
                <table className="cart-table">
                  <thead>
                    <tr>
                      <th className="cart-table__col-product">Produk</th>
                      <th className="cart-table__col-price">Harga</th>
                      <th className="cart-table__col-qty">Jumlah</th>
                      <th className="cart-table__col-sub">Subtotal</th>
                      <th className="cart-table__col-remove">
                        <span className="visually-hidden">Hapus</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((line) => {
                      const p = line?.product ?? {};
                      const shortId = p.shortId ?? p.short_id;
                      const title = productTitle(p);
                      const img = productImage(p);
                      const unit = Number(p?.price ?? 0);
                      const qty = Number(line?.quantity ?? 0);
                      const lineSub = Number(line?.lineSubtotal ?? unit * qty);
                      const cap = stockCap(p);
                      const cat = categoryLabel(p?.category);
                      const lineBusy =
                        busyLine === shortId || busyLine === '__all__';

                      return (
                        <tr key={line.lineId ?? `${shortId}-${qty}`}>
                          <td className="cart-table__product">
                            <div className="cart-table__product-inner">
                              {img ?
                                <img
                                  src={img}
                                  alt=""
                                  className="cart-table__thumb"
                                />
                              : <div className="cart-table__thumb cart-table__thumb--placeholder" />}
                              <div>
                                <Link
                                  to={`/products/${shortId}`}
                                  className="cart-table__name"
                                >
                                  {title}
                                </Link>
                                {cat ?
                                  <p className="cart-table__meta">{cat}</p>
                                : null}
                                <p className="cart-table__unit-mobile">
                                  {formatRupiah(unit)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="cart-table__price">
                            {formatRupiah(unit)}
                          </td>
                          <td className="cart-table__qty">
                            <div className="cart-qty">
                              <button
                                type="button"
                                className="cart-qty__btn"
                                aria-label="Kurangi jumlah"
                                disabled={lineBusy}
                                onClick={() =>
                                  shortId &&
                                  patchQty(shortId, qty - 1)}
                              >
                                −
                              </button>
                              <span className="cart-qty__value">{qty}</span>
                              <button
                                type="button"
                                className="cart-qty__btn"
                                aria-label="Tambah jumlah"
                                disabled={
                                  lineBusy ||
                                  (Number.isFinite(cap) && qty >= cap)
                                }
                                onClick={() =>
                                  shortId &&
                                  patchQty(shortId, qty + 1)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="cart-table__sub">
                            {formatRupiah(lineSub)}
                          </td>
                          <td className="cart-table__remove">
                            <button
                              type="button"
                              className="cart-table__remove-btn"
                              aria-label={`Hapus ${title}`}
                              disabled={lineBusy}
                              onClick={() =>
                                shortId && patchQty(shortId, 0)}
                            >
                              <svg
                                className="cart-table__remove-icon"
                                width="18"
                                height="18"
                                viewBox="0 0 24 24"
                                aria-hidden="true"
                              >
                                <path
                                  d="M6 6l12 12M18 6L6 18"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2.25"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>

            <aside className="cart-page__aside" aria-label="Ringkasan">
              <div className="cart-summary">
                <h2 className="cart-summary__title">Ringkasan</h2>
                <ul className="cart-summary__lines">
                  {summaryRows.map((row) => (
                    <li key={row.key} className="cart-summary__line">
                      <span>{row.label}</span>
                      <span>{formatRupiah(row.value)}</span>
                    </li>
                  ))}
                </ul>
                <div className="cart-summary__total">
                  <span>Total</span>
                  <span>{formatRupiah(grandTotal)}</span>
                </div>
                <p className="cart-summary__note">
                  Total termasuk perkiraan ongkos kirim untuk area standar.
                </p>
                <Link
                  to="/checkout"
                  className="cart-page__btn cart-page__btn--block"
                >
                  Lanjut ke checkout
                </Link>
              </div>
            </aside>
          </div>
        : null}
      </div>
    </main>
  );
}
