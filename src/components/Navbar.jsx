import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { getCart } from '../api/cartApi.js';
import { useAuth } from '../hooks/useAuth.js';
import '../styles/Navbar.css';

function IconSearch() {
  return (
    <svg className="navbar__icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
      />
    </svg>
  );
}

function IconBag() {
  return (
    <svg className="navbar__icon-svg" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="currentColor"
        d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2h2V8h8v2h2V8h2v12z"
      />
    </svg>
  );
}

export default function Navbar() {
  const { user, logout, ready } = useAuth();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const badgeCount = user ? cartCount : 0;

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await getCart();
        if (!cancelled) setCartCount(Number(res.data?.itemCount ?? 0));
      } catch {
        if (!cancelled) setCartCount(0);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, location.pathname]);

  useEffect(() => {
    function onCartUpdated() {
      if (!user) return;
      getCart()
        .then((res) => setCartCount(Number(res.data?.itemCount ?? 0)))
        .catch(() => setCartCount(0));
    }
    window.addEventListener('cart:updated', onCartUpdated);
    return () => window.removeEventListener('cart:updated', onCartUpdated);
  }, [user]);

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <NavLink to="/" className="navbar__brand" end>
          <span className="navbar__logo">Market</span>
          <span className="navbar__logo navbar__logo--accent">In</span>
        </NavLink>

        <nav className="navbar__center" aria-label="Menu utama">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `navbar__navlink${isActive ? ' navbar__navlink--active' : ''}`
            }
            end
          >
            Beranda
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `navbar__navlink${isActive ? ' navbar__navlink--active' : ''}`
            }
          >
            Produk
          </NavLink>
        </nav>

        <div className="navbar__actions">
          <Link
            to="/products"
            className="navbar__icon-btn"
            aria-label="Cari di toko"
          >
            <IconSearch />
          </Link>
          <Link
            to="/cart"
            className="navbar__icon-btn navbar__cart-wrap"
            aria-label="Keranjang"
          >
            <IconBag />
            {badgeCount > 0 ?
              <span className="navbar__cart-badge">
                {badgeCount > 99 ? '99+' : badgeCount}
              </span>
            : null}
          </Link>
          {!ready ? null : user ? (
            <div className="navbar__user">
              <span className="navbar__user-name" title={user.email}>
                {user.name || user.email || 'Akun'}
              </span>
              <button type="button" className="navbar__logout" onClick={logout}>
                Keluar
              </button>
            </div>
          ) : (
            <Link to="/login" className="navbar__login">
              Masuk
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
