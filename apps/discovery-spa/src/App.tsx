/**
 * WebWaka Discovery SPA — App shell
 * D1-1: React SPA replacing the server-side-rendered discovery worker.
 */
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { useState, FormEvent } from 'react';

import Home      from './pages/Home';
import InPlace   from './pages/InPlace';
import Search    from './pages/Search';
import Category  from './pages/Category';
import GeoDetail from './pages/GeoDetail';
import Profile   from './pages/Profile';

export default function App() {
  const [q, setQ] = useState('');
  const navigate  = useNavigate();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (q.trim()) navigate(`/discover/search?q=${encodeURIComponent(q.trim())}`);
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header style={{
        background: 'var(--green)',
        padding: '0 1.25rem',
        height: 58,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
      }}>
        <Link to="/discover" style={{
          fontWeight: 800, fontSize: '1.25rem', color: '#fff',
          letterSpacing: '-0.5px', textDecoration: 'none',
        }}>
          WebWaka
        </Link>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', flex: 1, maxWidth: 440, margin: '0 1.5rem' }}>
          <input
            type="search" placeholder="Search businesses, services..."
            value={q} onChange={e => setQ(e.target.value)}
            style={{ flex: 1, borderRadius: 24, border: 'none', padding: '0.5rem 1rem', fontSize: '0.9rem' }}
          />
          <button type="submit" style={{
            background: '#fff', color: 'var(--green)', border: 'none',
            borderRadius: 24, padding: '0.5rem 1.25rem',
            fontWeight: 700, fontSize: '0.875rem',
          }}>
            Search
          </button>
        </form>

        <nav style={{ display: 'flex', gap: '1rem' }}>
          <a href="https://app.webwaka.com" target="_blank" rel="noopener noreferrer"
            style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.875rem', fontWeight: 600 }}>
            Sign in
          </a>
        </nav>
      </header>

      {/* ── Routes ───────────────────────────────────────────────────── */}
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"                           element={<Navigate to="/discover" replace />} />
          <Route path="/discover"                   element={<Home />} />
          <Route path="/discover/in/:placeId"       element={<InPlace />} />
          <Route path="/discover/search"            element={<Search />} />
          <Route path="/discover/category/:cat"     element={<Category />} />
          <Route path="/discover/geo/:placeId"      element={<GeoDetail />} />
          <Route path="/discover/:entityType/:id"   element={<Profile />} />
          <Route path="*"                           element={<Navigate to="/discover" replace />} />
        </Routes>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer style={{
        background: '#1f2937', color: '#9ca3af',
        padding: '1.5rem 1.25rem',
        textAlign: 'center', fontSize: '0.8125rem',
      }}>
        <p>
          &copy; {new Date().getFullYear()} WebWaka &mdash; Nigeria&apos;s Business Directory &nbsp;|&nbsp;
          <a href="/privacy" style={{ color: '#9ca3af' }}>Privacy</a> &nbsp;|&nbsp;
          <a href="/terms"   style={{ color: '#9ca3af' }}>Terms</a>
        </p>
      </footer>
    </div>
  );
}
