/**
 * In-place listings — /discover/in/:placeId
 */
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { discoveryApi, type Listing, type Place } from '../lib/api';
import ListingCard from '../components/ListingCard';

export default function InPlace() {
  const { placeId } = useParams<{ placeId: string }>();
  const [listings, setListings] = useState<Listing[]>([]);
  const [place,    setPlace]    = useState<Place | null>(null);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!placeId) return;
    setLoading(true); setError('');
    discoveryApi.inPlace(placeId)
      .then(d => { setListings(d.listings); setPlace(d.place); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, [placeId]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.25rem' }}>
      <nav style={{ marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--muted)' }}>
        <Link to="/discover">Home</Link> &rsaquo; {place?.name ?? placeId}
      </nav>

      <h1 style={{ fontWeight: 700, fontSize: '1.375rem', marginBottom: '1.5rem' }}>
        Businesses in {place?.name ?? placeId}
        <span style={{ fontWeight: 400, fontSize: '1rem', color: 'var(--muted)', marginLeft: 8 }}>
          ({listings.length})
        </span>
      </h1>

      {error   && <p style={{ color: '#dc2626' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}

      {!loading && listings.length === 0 && !error && (
        <p style={{ color: 'var(--muted)' }}>No listings in this area yet.</p>
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
