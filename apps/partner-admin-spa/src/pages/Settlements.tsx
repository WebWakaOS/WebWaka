/**
 * Settlements page — E1-6: Settlement history table
 */
import { useEffect, useState } from 'react';
import { partnersApi, type Settlement } from '../lib/api';

const STATUS_COLORS: Record<string, string> = {
  paid:       '#16a34a',
  processing: '#d97706',
  pending:    '#6b7280',
};

function fmt(kobo: number): string {
  return '₦' + (kobo / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 });
}

export default function Settlements() {
  const [rows,  setRows]  = useState<Settlement[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    partnersApi.settlements()
      .then(d => { setRows(d.settlements); setLoading(false); })
      .catch(e => { setError((e as Error).message); setLoading(false); });
  }, []);

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Settlement History</h2>
      {error   && <p style={{ color: '#ef4444' }}>{error}</p>}
      {loading && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {!loading && rows.length === 0 && !error && (
        <p style={{ color: 'var(--muted)' }}>No settlements recorded yet.</p>
      )}
      {rows.length > 0 && (
        <div style={{ overflowX: 'auto' }}>
          <table style={{
            width: '100%', borderCollapse: 'collapse',
            fontSize: '0.875rem',
          }}>
            <thead>
              <tr style={{ background: 'var(--dark)', color: 'var(--muted)', textAlign: 'left' }}>
                {['Period', 'Gross GMV', 'Partner Share', 'Rate', 'Status'].map(h => (
                  <th key={h} style={{ padding: '0.625rem 0.875rem', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    {s.period_start} → {s.period_end}
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>{fmt(s.gross_gmv_kobo)}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>{fmt(s.partner_share_kobo)}</td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    {(s.share_basis_points / 100).toFixed(2)}%
                  </td>
                  <td style={{ padding: '0.75rem 0.875rem' }}>
                    <span style={{
                      display: 'inline-block',
                      padding: '2px 10px',
                      borderRadius: 20,
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: '#fff',
                      background: STATUS_COLORS[s.status] ?? '#6b7280',
                    }}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
