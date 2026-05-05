import React, { useState } from 'react';
import { authAPI } from '../services/api';

type Mode = 'signin' | 'register';

interface LoginProps {
  onSuccess: () => void;
}

export default function Login({ onSuccess }: LoginProps) {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shopName, setShopName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authAPI.login(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await authAPI.register({
        name: shopName.trim(),
        owner_name: ownerName.trim(),
        email: email.trim(),
        password,
        state: state.trim() || undefined,
        city: city.trim() || undefined,
      });
      await authAPI.login(email.trim(), password);
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full rounded-2xl border border-surface-container-highest bg-surface-container-low px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20';

  return (
    <div className="min-h-screen bg-surface flex flex-col max-w-md mx-auto px-6 py-12 justify-center">
      <div className="mb-10 text-center">
        <h1 className="text-2xl font-extrabold text-primary tracking-tight">ShelfSense</h1>
        <p className="mt-2 text-sm text-on-surface-variant">
          {mode === 'signin' ? 'Sign in to your shop' : 'Create a shop account'}
        </p>
      </div>

      <div className="flex rounded-2xl bg-surface-container-low p-1 mb-6">
        <button
          type="button"
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
            mode === 'signin' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
          }`}
          onClick={() => {
            setMode('signin');
            setError(null);
          }}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
            mode === 'register' ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'
          }`}
          onClick={() => {
            setMode('register');
            setError(null);
          }}
        >
          Register
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <form onSubmit={mode === 'signin' ? handleSignIn : handleRegister} className="space-y-4">
        {mode === 'register' && (
          <>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Shop name
              </label>
              <input
                className={inputClass}
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                autoComplete="organization"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Your name
              </label>
              <input
                className={inputClass}
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          </>
        )}
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Email
          </label>
          <input
            type="email"
            className={inputClass}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Password
          </label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
          />
        </div>
        {mode === 'register' && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                State (optional)
              </label>
              <input
                className={inputClass}
                value={state}
                onChange={(e) => setState(e.target.value)}
                autoComplete="address-level1"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                City (optional)
              </label>
              <input
                className={inputClass}
                value={city}
                onChange={(e) => setCity(e.target.value)}
                autoComplete="address-level2"
              />
            </div>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-on-primary shadow-lg shadow-primary/25 disabled:opacity-60 active:scale-[0.98] transition-transform"
        >
          {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>

      <p className="mt-8 text-center text-[11px] text-on-surface-variant/70">
        Run the API with{' '}
        <code className="rounded bg-surface-container-highest px-1 py-0.5 text-on-surface">uvicorn main:app --reload</code>{' '}
        in <code className="rounded bg-surface-container-highest px-1 py-0.5">BackEnd</code>.
      </p>
    </div>
  );
}
