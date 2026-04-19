import { Link } from 'react-router-dom';
import '../styles/Auth.css';

/**
 * @param {{
 *   title: string;
 *   subtitle: string;
 *   children: import('react').ReactNode;
 *   footer?: import('react').ReactNode;
 * }} props
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  return (
    <main className="auth-page">
      <aside className="auth-page__visual" aria-hidden="true">
        <Link to="/" className="auth-page__brand">
          <span className="auth-page__brand-text">Market</span>
          <span className="auth-page__brand-text auth-page__brand-text--accent">In</span>
        </Link>
      </aside>
      <div className="auth-page__panel">
        <div className="auth-page__card">
          <h1 className="auth-page__title">{title}</h1>
          <p className="auth-page__subtitle">{subtitle}</p>
          {children}
          {footer ? <div className="auth-page__footer">{footer}</div> : null}
        </div>
      </div>
    </main>
  );
}
