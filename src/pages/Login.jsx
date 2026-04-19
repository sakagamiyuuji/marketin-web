import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../api/authApi.js';
import AuthShell from '../components/AuthShell.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { redirectAfterAuthPath } from '../utils/redirectAfterAuth.js';

const REMEMBER_EMAIL_KEY = 'marketin_remember_email';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuth();
  const [email, setEmail] = useState(
    () => localStorage.getItem(REMEMBER_EMAIL_KEY) || '',
  );
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(
    () => Boolean(localStorage.getItem(REMEMBER_EMAIL_KEY)),
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await login({ email, password });
      loginSuccess(data);
      if (remember) {
        localStorage.setItem(REMEMBER_EMAIL_KEY, email);
      } else {
        localStorage.removeItem(REMEMBER_EMAIL_KEY);
      }
      navigate(redirectAfterAuthPath(location.state), { replace: true });
    } catch (err) {
      const payload = err.response?.data;
      const msg =
        payload?.message ||
        payload?.error ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.msg) ||
        'Gagal masuk. Periksa email dan kata sandi.';
      setError(typeof msg === 'string' ? msg : 'Gagal masuk.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Selamat datang 👋"
      subtitle="Silakan masuk di sini"
      footer={
        <p>
          Belum punya akun? <Link to="/register">Daftar</Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} noValidate>
        {error ? (
          <p className="auth-page__error" role="alert">
            {error}
          </p>
        ) : null}

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            className="auth-field__input"
            placeholder="nama@email.com"
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            required
          />
        </div>

        <PasswordField
          id="login-password"
          label="Kata sandi"
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          required
        />

        <div className="auth-page__row">
          <label className="auth-page__remember">
            <input
              type="checkbox"
              checked={remember}
              onChange={(ev) => setRemember(ev.target.checked)}
            />
            Ingat saya
          </label>
          <button type="button" className="auth-page__link">
            Lupa kata sandi?
          </button>
        </div>

        <button type="submit" className="auth-page__submit" disabled={loading}>
          {loading ? 'Memproses…' : 'Masuk'}
        </button>
      </form>
    </AuthShell>
  );
}
