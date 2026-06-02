import { Boxes, LockKeyhole } from 'lucide-react';
import { useState } from 'react';
import api from '../api';
import StatusMessage from '../components/StatusMessage';

function Login({ onLogin }) {
  const [form, setForm] = useState({ username: 'admin', password: 'admin123' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('smsToken', data.token);
      localStorage.setItem('smsUsername', data.username);
      onLogin(data.username);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-brand px-4 py-8 lg:grid-cols-[1.1fr_0.9fr] lg:px-0 lg:py-0">
      <section className="hidden items-center px-12 text-white lg:flex">
        <div className="max-w-xl">
          <div className="mb-8 grid h-14 w-14 place-items-center rounded bg-white/10 ring-1 ring-white/20">
            <Boxes size={30} />
          </div>
          <p className="text-sm font-bold uppercase tracking-widest text-teal-100">StockHub Ltd</p>
          <h1 className="mt-3 text-5xl font-black leading-tight">Inventory control for Kigali distribution teams</h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-slate-300">
            Record product receipts, warehouse movement, and stock reports from one manager console.
          </p>
        </div>
      </section>

      <section className="grid place-items-center">
        <form className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-xl sm:p-8" onSubmit={handleSubmit}>
          <div className="mb-6 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded bg-brand text-white">
              <LockKeyhole size={24} />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-wider text-brand">StockHub SMS</p>
              <h2 className="text-2xl font-black text-ink">Manager Login</h2>
            </div>
          </div>
        <StatusMessage message={error} type="error" />
        <label className="label" htmlFor="username">Username</label>
        <input
          className="field mb-4"
          id="username"
          onChange={(event) => setForm({ ...form, username: event.target.value })}
          required
          value={form.username}
        />
        <label className="label" htmlFor="password">Password</label>
        <input
          className="field mb-6"
          id="password"
          onChange={(event) => setForm({ ...form, password: event.target.value })}
          required
          type="password"
          value={form.password}
        />
        <button className="btn-primary w-full" disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Login'}
        </button>
        </form>
      </section>
    </main>
  );
}

export default Login;
