import { Link } from 'react-router-dom';
import '../styles/Cart.css';

/** Placeholder checkout (coming soon) */
export default function Checkout() {
  return (
    <main className="cart-page cart-page--checkout-placeholder">
      <div className="cart-page__inner">
        <h1 className="cart-page__title">Checkout</h1>
        <p className="cart-page__checkout-lead">Coming Soon</p>
        <Link to="/cart" className="cart-page__btn cart-page__btn--outline">
          ← Kembali ke keranjang
        </Link>
      </div>
    </main>
  );
}
