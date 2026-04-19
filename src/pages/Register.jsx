import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { register } from '../api/authApi.js';
import AuthShell from '../components/AuthShell.jsx';
import PasswordField from '../components/PasswordField.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { redirectAfterAuthPath } from '../utils/redirectAfterAuth.js';

export default function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSuccess } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (password.length > 0 && password.length < 6) {
      setError('Kata sandi minimal 6 karakter.');
      return;
    }
    setLoading(true);
    try {
      const { data } = await register({ name, email, password });
      loginSuccess(data);
      navigate(redirectAfterAuthPath(location.state), { replace: true });
    } catch (err) {
      const payload = err.response?.data;
      const msg =
        payload?.message ||
        payload?.error ||
        (Array.isArray(payload?.errors) && payload.errors[0]?.msg) ||
        'Gagal mendaftar. Coba lagi.';
      setError(typeof msg === 'string' ? msg : 'Gagal mendaftar.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell
      title="Buat akun 👋"
      subtitle="Daftar untuk mulai berbelanja"
      footer={
        <p>
          Sudah punya akun? <Link to="/login">Masuk</Link>
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
          <label className="auth-field__label" htmlFor="register-name">
            Nama
          </label>
          <input
            id="register-name"
            name="name"
            type="text"
            autoComplete="name"
            className="auth-field__input"
            placeholder="Nama lengkap"
            value={name}
            onChange={(ev) => setName(ev.target.value)}
            required
          />
        </div>

        <div className="auth-field">
          <label className="auth-field__label" htmlFor="register-email">
            Email
          </label>
          <input
            id="register-email"
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
          id="register-password"
          label="Kata sandi"
          name="password"
          autoComplete="new-password"
          placeholder="Minimal 6 karakter"
          value={password}
          onChange={(ev) => setPassword(ev.target.value)}
          minLength={6}
          required
          hint={<p className="auth-field__hint">Minimal 6 karakter.</p>}
        />

        <button type="submit" className="auth-page__submit" disabled={loading}>
          {loading ? 'Memproses…' : 'Daftar'}
        </button>
      </form>
    </AuthShell>
  );
}
