import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllProducts, unwrapProductList } from '../api/productApi';
import ShopProductCard from '../components/ShopProductCard.jsx';
import SkeletonCard from '../components/SkeletonCard.jsx';
import { compareProductIdDesc, productId } from '../utils/format';
import '../styles/Home.css';

function latestProducts(list, n = 6) {
  const sorted = [...list].sort(compareProductIdDesc);
  return sorted.slice(0, n);
}

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getAllProducts();
        if (cancelled) return;
        const list = unwrapProductList(res);
        setProducts(latestProducts(list, 6));
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

  return (
    <main className="home">
      <section className="home-hero" aria-labelledby="home-hero-heading">
        <div className="home-hero__inner">
          <div className="home-hero__col home-hero__col--text">
            <div className="home-hero__text-block">
              <span className="home-hero__watermark" aria-hidden="true">
                BEST
              </span>
              <p className="home-hero__eyebrow">Koleksi eksklusif</p>
              <h1 id="home-hero-heading" className="home-hero__title">
                Pilihan Untukmu
              </h1>
              <p className="home-hero__promo">HINGGA 40% OFF</p>
              <Link to="/products" className="home-hero__cta">
                <span>Belanja sekarang</span>
                <svg
                  className="home-hero__cta-arrow"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fill="currentColor"
                    d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
                  />
                </svg>
              </Link>
            </div>
          </div>

          <div className="home-hero__col home-hero__col--visual">
            <div className="home-hero__visual">
              <div className="home-hero__frame" aria-hidden="true" />
              <img
                className="home-hero__img"
                src="/hero-banner.png"
                alt="Model mengenakan outfit pilihan MarketIn"
                width={560}
                height={700}
                loading="eager"
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      <section
        className="home-products"
        aria-labelledby="home-products-title"
      >
        <div className="home-products__head">
          <h2 id="home-products-title" className="home-products__title">
            Produk pilihan
          </h2>
          <Link to="/products" className="home-products__link">
            Lihat semua
          </Link>
        </div>

        {error && (
          <p className="home-products__error" role="alert">
            Gagal memuat produk. Periksa API atau file{' '}
            <code className="home-products__code">.env</code>.
          </p>
        )}

        <div className="home-products__grid">
          {loading ?
            Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={`sk-${i}`} variant="shop" />
            ))
          : products.map((p) => (
              <ShopProductCard key={productId(p)} product={p} view="grid" />
            ))}
        </div>
      </section>
    </main>
  );
}
