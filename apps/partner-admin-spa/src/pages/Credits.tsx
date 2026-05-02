/**
 * Credits page — E1-5: Credit pool management
 */
import { useEffect, useState, FormEvent } from 'react';
import { partnersApi, type CreditsData, type AllocateResult } from '../lib/api';

export default function Credits() {
  const [data,       setData]       = useState<CreditsData | null>(null);
  const [error,      setError]      = useState('');
  const [tenant,     setTenant]     = useState('');
  const [amount,     setAmount]     = useState('');
  const [note,       setNote]       = useState('');
  const [allocMsg,   setAllocMsg]   = useState('');
  const [allocErr,   setAllocErr]   = useState('');
  const [allocating, setAllocating] = useState(false);

  async function load() {
    try {
      const d = await partnersApi.credits();
      setData(d);
      setError('');
    } catch (e) { setError((e as Error).message); }
  }

  useEffect(() => { load(); }, []);

  async function handleAllocate(e: FormEvent) {
    e.preventDefault();
    const amountNum = parseInt(amount, 10);
    if (!tenant || isNaN(amountNum) || amountNum <= 0) {
      setAllocErr('Recipient tenant and a positive amount are required.'); return;
    }
    setAllocErr(''); setAllocMsg(''); setAllocating(true);
    try {
      const res: AllocateResult = await partnersApi.allocateCredits({
        recipientTenant: tenant, amountWc: amountNum, note: note || undefined,
      });
      setAllocMsg(`Allocated ${res.amountWc} WC to ${res.recipientTenant}. New balance: ${res.partnerBalanceAfter} WC`);
      setTenant(''); setAmount(''); setNote('');
      await load();
    } catch (e) { setAllocErr((e as Error).message); } finally { setAllocating(false); }
  }

  const w = data?.wallet;

  return (
    <div>
      <h2 style={{ fontWeight: 700, marginBottom: '1.5rem' }}>Credit Pool</h2>

      {/* Balance summary */}
      {error && <p style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</p>}
      {!data && !error && <p style={{ color: 'var(--muted)' }}>Loading...</p>}
      {w && (
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '0.875rem', marginBottom: '2rem',
        }}>
          {[
            { label: 'Current Balance',          value: `${w.balanceWc} WC`           },
            { label: 'Lifetime Purchased',        value: `${w.lifetimePurchasedWc} WC` },
            { label: 'Total Allocated to Tenants',value: `${data?.totalAllocatedWc ?? '—'} WC` },
          ].map(({ label, value }) => (
            <div key={label} style={{
              background: 'var(--dark)', border: '1px solid var(--border)',
              borderRadius: 10, padding: '1rem',
            }}>
              <div style={{ fontSize: '1.375rem', fontWeight: 800 }}>{value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4 }}>{label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Allocate form */}
      <div style={{
        background: 'var(--dark)', border: '1px solid var(--border)',
        borderRadius: 12, padding: '1.5rem', maxWidth: 480,
      }}>
        <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Allocate Credits</h3>
        <form onSubmit={handleAllocate} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <input
            type="text" placeholder="Recipient Tenant ID" value={tenant}
            onChange={e => setTenant(e.target.value)} style={{ width: '100%' }}
          />
          <input
            type="number" placeholder="Amount (WC)" value={amount}
            onChange={e => setAmount(e.target.value)} min={1} style={{ width: '100%' }}
          />
          <input
            type="text" placeholder="Note (optional)" value={note}
            onChange={e => setNote(e.target.value)} style={{ width: '100%' }}
          />
          {allocErr && <p style={{ color: '#ef4444', fontSize: '0.8125rem' }}>{allocErr}</p>}
          {allocMsg && <p style={{ color: 'var(--green)', fontSize: '0.8125rem' }}>{allocMsg}</p>}
          <button
            type="submit" disabled={allocating}
            style={{
              padding: '0.625rem', background: 'var(--blue)', color: '#fff',
              border: 'none', borderRadius: 7, fontWeight: 700, fontSize: '0.875rem',
              opacity: allocating ? 0.7 : 1,
            }}
          >
            {allocating ? 'Allocating...' : 'Allocate'}
          </button>
        </form>
      </div>
    </div>
  );
}
