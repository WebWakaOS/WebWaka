/**
 * Reusable listing card component
 */
import { Link } from 'react-router-dom';
import type { Listing } from '../lib/api';

interface Props { listing: Listing; }

export default function ListingCard({ listing }: Props) {
  const stars = listing.rating ? Math.round(listing.rating) : 0;

  return (
    <Link
      to={`/discover/${listing.vertical ?? 'business'}/${listing.id}`}
      style={{ textDecoration: 'none', color: 'inherit' }}
    >
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 12,
        overflow: 'hidden',
        transition: 'box-shadow 0.15s',
        cursor: 'pointer',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
        onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.1)')}
        onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
      >
        {/* Image */}
        <div style={{
          height: 140, background: '#e5e7eb',
          overflow: 'hidden', position: 'relative',
        }}>
          {listing.imageUrl ? (
            <img
              src={listing.imageUrl} alt={listing.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{
              height: '100%', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#9ca3af', fontSize: '2rem',
            }}>
              🏪
            </div>
          )}
          {listing.category && (
            <span style={{
              position: 'absolute', bottom: 8, left: 8,
              background: 'var(--green)', color: '#fff',
              borderRadius: 20, padding: '2px 10px',
              fontSize: '0.7rem', fontWeight: 700,
            }}>
              {listing.category}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: '0.875rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: 4, lineHeight: 1.3 }}>
            {listing.name}
          </h3>
          {listing.placeName && (
            <p style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 4 }}>
              📍 {listing.placeName}
            </p>
          )}
          {listing.description && (
            <p style={{
              fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.4,
              overflow: 'hidden', display: '-webkit-box',
              WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
              flex: 1,
            }}>
              {listing.description}
            </p>
          )}
          {stars > 0 && (
            <div style={{ marginTop: 8, fontSize: '0.8125rem', color: '#f59e0b' }}>
              {'★'.repeat(stars)}{'☆'.repeat(5 - stars)}
              {listing.reviewCount ? (
                <span style={{ color: 'var(--muted)', marginLeft: 4 }}>
                  ({listing.reviewCount})
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
