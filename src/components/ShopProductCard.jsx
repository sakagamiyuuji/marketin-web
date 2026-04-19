import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addCartItem } from '../api/cartApi.js';
import { useAuth } from '../hooks/useAuth.js';
import {
  formatRupiah,
  productBrand,
  productId,
  productImage,
  productOriginalPrice,
  productTitle,
} from '../utils/format';
import '../styles/ShopProductCard.css';

export default function ShopProductCard({ product, view = 'grid' }) {
  const { user, ready } = useAuth();
  const [adding, setAdding] = useState(false);
  const id = productId(product);
  const title = productTitle(product);
  const image = productImage(product);
  const price = product?.price;
  const original = productOriginalPrice(product);
  const brand = productBrand(product);
  const showOld =
    original != null && Number(original) > Number(price || 0);

  const listClass = view === 'list' ? ' shop-card--list' : '';

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!ready || !id) return;
    if (!user) {
      window.alert('Harap login terlebih dahulu');
      return;
    }
    setAdding(true);
    try {
      await addCartItem(id, 1);
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
    <article className={`shop-card${listClass}`}>
      <div className="shop-card__media">
        <Link
          to={`/products/${id}`}
          className="shop-card__img-link"
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ?
            <img
              src={image}
              alt=""
              className="shop-card__image"
              loading="lazy"
            />
          : <div className="shop-card__image shop-card__image--placeholder" />}
        </Link>

        <div className="shop-card__hover-layer">
          <button
            type="button"
            className="shop-card__cart-btn"
            onClick={handleAddToCart}
            disabled={adding}
          >
            {adding ? 'Menambahkan…' : 'Tambah ke Keranjang'}
          </button>
        </div>
      </div>

      <div className="shop-card__body">
        <p className="shop-card__brand">{brand}</p>
        <h3 className="shop-card__title-wrap">
          <Link to={`/products/${id}`} className="shop-card__title">
            {title}
          </Link>
        </h3>
        <div className="shop-card__prices">
          <span className="shop-card__price">{formatRupiah(price)}</span>
          {showOld && (
            <span className="shop-card__price-old">{formatRupiah(original)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
