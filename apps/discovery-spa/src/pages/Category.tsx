/**
 * Category browse — /discover/category/:cat
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discoveryApi, type Listing } from '../lib/api';
import ListingCard from '../components/ListingCard';

export default function Category() {
  const { cat }    = useParams<{ cat: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!cat) return;
    setLoading(true); setError('');
    discoveryApi.category(cat)
      .then(d => { setListings(d.listings); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [cat]);

  const title = cat ? decodeURIComponent(cat) : '';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; {title}
      </nav>

      <h1 style={{ fontWeight: 700, fontSize: '1.375rem', marginBottom: '1.5rem' }}>
        {title}
        <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--muted)', marginLeft: 8 }}>
          ({listings.length})
        </span>
      </h1>

      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}

      {!loading && listings.length === 0 && !error && (
        <p style={{ color: 'var(--muted)' }}>No listings in this category yet.</p>
      )}

      {listings.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}>
          {listings.map(l => <ListingCard key={l.id} listing={l} />)}
        </div>
      )}
    </div>
  );
}
