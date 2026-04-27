import { useState, useEffect, useCallback } from 'react';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface WakaPageSummary {
  id: string;
  slug: string;
  publicationState: string;
  title: string | null;
  publishedAt: number | null;
  createdAt: number;
}

interface WakaBlock {
  id: string;
  blockType: string;
  sortOrder: number;
  isVisible: boolean;
  configJson: string;
}

interface WakaLead {
  id: string;
  name: string | null;
  phone: string | null;
  email: string | null;
  message: string | null;
  status: string;
  created_at: number;
}

interface PageDetailResponse {
  page: WakaPageSummary;
  blocks: WakaBlock[];
}

interface LeadsResponse {
  leads: WakaLead[];
  total: number;
}

interface QrResponse {
  publicUrl: string;
  qrUrl: string;
}

// ---------------------------------------------------------------------------
// Available block types (mirrors BLOCK_TYPES in @webwaka/wakapage-blocks)
// ---------------------------------------------------------------------------

const BLOCK_TYPES: Record<string, string> = {
  hero: 'Hero Banner',
  bio: 'About / Bio',
  offerings: 'Services & Offerings',
  contact_form: 'Contact Form',
  social_links: 'Social Links',
  cta_button: 'Call to Action',
  gallery: 'Photo Gallery',
  testimonials: 'Testimonials',
  faq: 'FAQ',
  map_embed: 'Map Embed',
  video_embed: 'Video Embed',
  blog_post: 'Recent Posts',
  event_list: 'Event List',
  community: 'Community',
  social_feed: 'Social Feed',
  countdown: 'Countdown',
  trust_badges: 'Trust Badges',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STATE_LABELS: Record<string, string> = {
  draft: 'Draft',
  published: 'Live',
  archived: 'Archived',
};

const STATE_COLORS: Record<string, string> = {
  draft: '#d97706',
  published: '#059669',
  archived: '#6b7280',
};

function formatDate(unixTs: number): string {
  return new Date(unixTs * 1000).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatusBadge({ state }: { state: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 100,
      background: `${STATE_COLORS[state] ?? '#6b7280'}22`,
      color: STATE_COLORS[state] ?? '#6b7280',
      fontSize: 12, fontWeight: 700,
    }}>
      <span style={{
        width: 7, height: 7, borderRadius: '50%',
        background: STATE_COLORS[state] ?? '#6b7280',
      }} />
      {STATE_LABELS[state] ?? state}
    </span>
  );
}

function BlockCard({
  block,
  onToggle,
  onDelete,
}: {
  block: WakaBlock;
  onToggle: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '12px 16px',
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
    }}>
      <span style={{
        flex: 1, fontSize: 14, fontWeight: 600, color: '#111827',
      }}>
        {BLOCK_TYPES[block.blockType] ?? block.blockType}
        {!block.isVisible && (
          <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>
            (hidden)
          </span>
        )}
      </span>
      <button
        onClick={() => onToggle(block.id, !block.isVisible)}
        style={{
          background: 'none', border: '1px solid #d1d5db', borderRadius: 6,
          padding: '4px 10px', fontSize: 12, cursor: 'pointer',
          color: block.isVisible ? '#374151' : '#9ca3af',
        }}
        title={block.isVisible ? 'Hide block' : 'Show block'}
      >
        {block.isVisible ? 'Hide' : 'Show'}
      </button>
      <button
        onClick={() => onDelete(block.id)}
        style={{
          background: 'none', border: '1px solid #fca5a5', borderRadius: 6,
          padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444',
        }}
        title="Remove block"
      >
        Remove
      </button>
    </div>
  );
}

function LeadCard({ lead }: { lead: WakaLead }) {
  return (
    <div style={{
      padding: '12px 16px',
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
    }}>
      <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 4 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>
          {lead.name ?? '(no name)'}
        </span>
        <span style={{ fontSize: 11, color: '#9ca3af' }}>
          {formatDate(lead.created_at)}
        </span>
        <span style={{
          marginLeft: 'auto', fontSize: 11, padding: '2px 8px',
          borderRadius: 100, background: '#f3f4f6', color: '#6b7280',
        }}>
          {lead.status}
        </span>
      </div>
      {lead.phone && (
        <p style={{ fontSize: 13, color: '#374151', margin: '2px 0' }}>
          📞 {lead.phone}
        </p>
      )}
      {lead.email && (
        <p style={{ fontSize: 13, color: '#374151', margin: '2px 0' }}>
          ✉️ {lead.email}
        </p>
      )}
      {lead.message && (
        <p style={{
          fontSize: 13, color: '#6b7280', margin: '6px 0 0',
          fontStyle: 'italic',
          overflow: 'hidden', textOverflow: 'ellipsis',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        } as React.CSSProperties}>
          "{lead.message}"
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddBlockModal
// ---------------------------------------------------------------------------

function AddBlockModal({
  onAdd,
  onClose,
  saving,
}: {
  onAdd: (blockType: string) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const [selected, setSelected] = useState<string>('');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24, width: '100%',
        maxWidth: 440, maxHeight: '80vh', overflowY: 'auto',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          Add a Block
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
          {Object.entries(BLOCK_TYPES).map(([type, label]) => (
            <button
              key={type}
              onClick={() => setSelected(type)}
              style={{
                textAlign: 'left', padding: '10px 14px',
                border: `2px solid ${selected === type ? '#0F4C81' : '#e5e7eb'}`,
                borderRadius: 8, background: selected === type ? '#eff6ff' : '#fff',
                cursor: 'pointer', fontSize: 14, fontWeight: selected === type ? 600 : 400,
                color: selected === type ? '#0F4C81' : '#374151',
              }}
            >
              {label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <Button onClick={onClose} style={{ background: '#f3f4f6', color: '#374151' }}>
            Cancel
          </Button>
          <Button
            onClick={() => selected && onAdd(selected)}
            disabled={!selected || saving}
            style={{ background: '#0F4C81', color: '#fff', opacity: (!selected || saving) ? 0.5 : 1 }}
          >
            {saving ? 'Adding…' : 'Add Block'}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// QrModal
// ---------------------------------------------------------------------------

function QrModal({ qr, onClose }: { qr: QrResponse; onClose: () => void }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200,
      padding: 16,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, padding: 24, width: '100%',
        maxWidth: 340, textAlign: 'center',
      }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
          Share Your WakaPage
        </h2>
        <img
          src={qr.qrUrl}
          alt="QR code for WakaPage"
          style={{ width: 200, height: 200, margin: '0 auto 16px', display: 'block' }}
        />
        <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16, wordBreak: 'break-all' }}>
          {qr.publicUrl}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <a
            href={qr.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: '10px 20px', borderRadius: 8, background: '#0F4C81', color: '#fff',
              textDecoration: 'none', fontSize: 14, fontWeight: 600,
            }}
          >
            View Live
          </a>
          <Button
            onClick={onClose}
            style={{ background: '#f3f4f6', color: '#374151' }}
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main WakaPage component
// ---------------------------------------------------------------------------

export default function WakaPageManager() {
  const { user } = useAuth();
  const workspaceId = user?.workspaceId;
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';

  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<WakaPageSummary | null>(null);
  const [blocks, setBlocks] = useState<WakaBlock[]>([]);
  const [leads, setLeads] = useState<WakaLead[]>([]);
  const [leadsTotal, setLeadsTotal] = useState(0);
  const [qr, setQr] = useState<QrResponse | null>(null);

  const [creating, setCreating] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [showAddBlock, setShowAddBlock] = useState(false);
  const [addingBlock, setAddingBlock] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [loadingQr, setLoadingQr] = useState(false);

  // Fetch the workspace's WakaPage on mount
  const loadPage = useCallback(async () => {
    if (!workspaceId) { setLoading(false); return; }
    setLoading(true);
    try {
      const resp = await api.get<{ pages: WakaPageSummary[] }>('/v0/wakapages');
      const first = resp.pages[0] ?? null;
      setPage(first);
      if (first) {
        const detail = await api.get<PageDetailResponse>(`/v0/wakapages/${first.id}`);
        setBlocks(detail.blocks ?? []);
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setPage(null);
      } else {
        toast.error('Failed to load WakaPage.');
      }
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => { void loadPage(); }, [loadPage]);

  // Load leads when page is available
  useEffect(() => {
    if (!page || !isAdmin) return;
    setLoadingLeads(true);
    api.get<LeadsResponse>(`/v0/wakapages/${page.id}/leads?limit=20`)
      .then(r => { setLeads(r.leads); setLeadsTotal(r.total); })
      .catch(() => { /* non-fatal */ })
      .finally(() => setLoadingLeads(false));
  }, [page, isAdmin]);

  const handleCreate = async () => {
    if (creating) return;
    setCreating(true);
    try {
      // Fetch the workspace's first profile to anchor the page
      const profilesResp = await api.get<{ profiles: Array<{ id: string }> }>(`/v0/profiles?workspaceId=${workspaceId}&limit=1`);
      const profileId = profilesResp.profiles?.[0]?.id;
      if (!profileId) {
        toast.error('Create a business profile first before setting up your WakaPage.');
        return;
      }
      await api.post('/v0/wakapages', { profile_id: profileId });
      toast.success('WakaPage created!');
      await loadPage();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        toast.error('A WakaPage already exists — refreshing…');
        await loadPage();
      } else {
        toast.error('Could not create WakaPage. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handlePublish = async () => {
    if (!page || publishing) return;
    setPublishing(true);
    try {
      await api.post(`/v0/wakapages/${page.id}/publish`, {});
      toast.success('WakaPage is now live!');
      await loadPage();
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Failed to publish. Please try again.');
      }
    } finally {
      setPublishing(false);
    }
  };

  const handleAddBlock = async (blockType: string) => {
    if (!page || addingBlock) return;
    setAddingBlock(true);
    try {
      await api.post(`/v0/wakapages/${page.id}/blocks`, { block_type: blockType, config: {} });
      toast.success(`${BLOCK_TYPES[blockType] ?? blockType} block added!`);
      setShowAddBlock(false);
      const detail = await api.get<PageDetailResponse>(`/v0/wakapages/${page.id}`);
      setBlocks(detail.blocks ?? []);
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error('Could not add block. Please try again.');
      }
    } finally {
      setAddingBlock(false);
    }
  };

  const handleToggleBlock = async (blockId: string, visible: boolean) => {
    if (!page) return;
    setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, isVisible: visible } : b));
    try {
      await api.patch(`/v0/wakapages/${page.id}/blocks/${blockId}`, { is_visible: visible ? 1 : 0 });
    } catch {
      toast.error('Could not update block visibility.');
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, isVisible: !visible } : b));
    }
  };

  const handleDeleteBlock = async (blockId: string) => {
    if (!page) return;
    const prev = blocks;
    setBlocks(b => b.filter(blk => blk.id !== blockId));
    try {
      await api.delete(`/v0/wakapages/${page.id}/blocks/${blockId}`);
      toast.success('Block removed.');
    } catch {
      toast.error('Could not remove block.');
      setBlocks(prev);
    }
  };

  const handleShowQr = async () => {
    if (!page || loadingQr) return;
    if (qr) { setShowQr(true); return; }
    setLoadingQr(true);
    try {
      const data = await api.get<QrResponse>(`/v0/wakapages/${page.id}/qr`);
      setQr(data);
      setShowQr(true);
    } catch {
      toast.error('Could not load QR code. Please try again.');
    } finally {
      setLoadingQr(false);
    }
  };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) {
    return (
      <div id="main-content" style={{ padding: '40px 24px', textAlign: 'center', color: '#6b7280' }}>
        Loading WakaPage…
      </div>
    );
  }

  if (!page) {
    return (
      <main id="main-content" style={{ padding: '32px 24px', maxWidth: 560, margin: '0 auto' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', marginBottom: 8 }}>
          My WakaPage
        </h1>
        <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 32 }}>
          Your WakaPage is a shareable public profile for your business — showcase services, share links, and capture leads.
        </p>

        <div style={{
          border: '2px dashed #d1d5db', borderRadius: 16, padding: 36, textAlign: 'center',
          background: '#f9fafb',
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }} aria-hidden="true">🌐</div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
            Create Your WakaPage
          </h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>
            Set up a professional public page for your business in seconds.
          </p>
          {isAdmin ? (
            <Button
              onClick={() => void handleCreate()}
              disabled={creating}
              style={{ background: '#0F4C81', color: '#fff', padding: '12px 28px', fontSize: 15 }}
            >
              {creating ? 'Creating…' : 'Create WakaPage'}
            </Button>
          ) : (
            <p style={{ fontSize: 13, color: '#9ca3af' }}>
              Contact your workspace admin to set up your WakaPage.
            </p>
          )}
        </div>
      </main>
    );
  }

  return (
    <main id="main-content" style={{ padding: '24px', maxWidth: 640, margin: '0 auto' }}>
      {showAddBlock && (
        <AddBlockModal
          onAdd={blockType => void handleAddBlock(blockType)}
          onClose={() => setShowAddBlock(false)}
          saving={addingBlock}
        />
      )}
      {showQr && qr && (
        <QrModal qr={qr} onClose={() => setShowQr(false)} />
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: '#111827', margin: 0 }}>
              My WakaPage
            </h1>
            {page.title && (
              <p style={{ fontSize: 13, color: '#6b7280', marginTop: 2 }}>{page.title}</p>
            )}
          </div>
          <StatusBadge state={page.publicationState} />
        </div>
        {page.publishedAt && (
          <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 6 }}>
            Published {formatDate(page.publishedAt)}
          </p>
        )}
      </div>

      {/* Action toolbar */}
      {isAdmin && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
          {page.publicationState !== 'published' && (
            <Button
              onClick={() => void handlePublish()}
              disabled={publishing}
              style={{ background: '#059669', color: '#fff', fontSize: 14 }}
            >
              {publishing ? 'Publishing…' : '🚀 Publish Now'}
            </Button>
          )}
          <Button
            onClick={() => void handleShowQr()}
            disabled={loadingQr}
            style={{ background: '#0F4C81', color: '#fff', fontSize: 14 }}
          >
            {loadingQr ? 'Loading…' : '📷 Share / QR Code'}
          </Button>
        </div>
      )}

      {/* Blocks section */}
      <section style={{ marginBottom: 32 }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 12,
        }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', margin: 0 }}>
            Blocks ({blocks.length})
          </h2>
          {isAdmin && (
            <Button
              onClick={() => setShowAddBlock(true)}
              style={{
                background: '#f0f9ff', color: '#0F4C81', fontSize: 13,
                border: '1px solid #bfdbfe',
              }}
            >
              + Add Block
            </Button>
          )}
        </div>

        {blocks.length === 0 ? (
          <div style={{
            padding: '24px', textAlign: 'center',
            border: '1px dashed #d1d5db', borderRadius: 10, background: '#f9fafb',
          }}>
            <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
              No blocks yet. Add a block to build your page.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {blocks
              .slice()
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map(block => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onToggle={(id, vis) => void handleToggleBlock(id, vis)}
                  onDelete={(id) => void handleDeleteBlock(id)}
                />
              ))}
          </div>
        )}
      </section>

      {/* Leads inbox */}
      {isAdmin && (
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 12 }}>
            Leads Inbox {leadsTotal > 0 && <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 400 }}>({leadsTotal} total)</span>}
          </h2>

          {loadingLeads ? (
            <p style={{ fontSize: 14, color: '#9ca3af' }}>Loading leads…</p>
          ) : leads.length === 0 ? (
            <div style={{
              padding: '20px', textAlign: 'center',
              border: '1px dashed #d1d5db', borderRadius: 10, background: '#f9fafb',
            }}>
              <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>
                No leads yet. When visitors fill your contact form, they'll appear here.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {leads.map(lead => (
                <LeadCard key={lead.id} lead={lead} />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
