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

// ---- Block config editors (H3 fix: per-block content editing) ----

const BLOCK_FIELDS: Record<string, Array<{ key: string; label: string; type?: string; placeholder?: string }>> = {
  hero:         [
    { key: 'title', label: 'Headline', placeholder: 'Welcome to my business' },
    { key: 'subtitle', label: 'Subtitle', placeholder: 'We offer quality services' },
    { key: 'ctaText', label: 'CTA Button text', placeholder: 'Contact us' },
    { key: 'ctaUrl', label: 'CTA Button URL', placeholder: 'https://...' },
    { key: 'backgroundImage', label: 'Background image URL (optional)', placeholder: 'https://...' },
  ],
  bio:          [
    { key: 'text', label: 'About text', placeholder: 'Tell customers about your business…' },
    { key: 'founderName', label: 'Founder / Contact name (optional)', placeholder: 'John Doe' },
    { key: 'yearsInBusiness', label: 'Years in business (optional)', placeholder: '5' },
  ],
  offerings:    [
    { key: 'title', label: 'Section title', placeholder: 'Our Services' },
    { key: 'item1', label: 'Offering 1', placeholder: 'Web Design — ₦50,000' },
    { key: 'item2', label: 'Offering 2', placeholder: 'Branding — ₦30,000' },
    { key: 'item3', label: 'Offering 3 (optional)', placeholder: 'Consulting — ₦10,000/hr' },
  ],
  contact_form: [
    { key: 'email', label: 'Receiving email', placeholder: 'you@business.com' },
    { key: 'phone', label: 'Contact phone', placeholder: '+2348000000000' },
    { key: 'successMessage', label: 'Thank-you message', placeholder: 'We will get back to you within 24 hours.' },
  ],
  social_links: [
    { key: 'instagram', label: 'Instagram URL', placeholder: 'https://instagram.com/yourbusiness' },
    { key: 'facebook', label: 'Facebook URL', placeholder: 'https://facebook.com/yourbusiness' },
    { key: 'twitter', label: 'Twitter/X URL', placeholder: 'https://x.com/yourbusiness' },
    { key: 'whatsapp', label: 'WhatsApp number', placeholder: '+2348000000000' },
    { key: 'tiktok', label: 'TikTok URL (optional)', placeholder: 'https://tiktok.com/@yourbusiness' },
    { key: 'youtube', label: 'YouTube URL (optional)', placeholder: 'https://youtube.com/@yourbusiness' },
  ],
  cta_button:   [
    { key: 'label', label: 'Button text', placeholder: 'Book now' },
    { key: 'url', label: 'Button URL', placeholder: 'https://...' },
    { key: 'subtitle', label: 'Supporting text (optional)', placeholder: 'Free consultation available' },
  ],
  map_embed:    [
    { key: 'address', label: 'Business address', placeholder: '12 Market Street, Lagos, Nigeria' },
    { key: 'landmark', label: 'Nearby landmark (optional)', placeholder: 'Near Ikeja City Mall' },
    { key: 'directions', label: 'Directions text (optional)', placeholder: 'Turn left at the junction…' },
  ],
  faq:          [
    { key: 'q1', label: 'Question 1', placeholder: 'What are your hours?' },
    { key: 'a1', label: 'Answer 1', placeholder: 'We are open 9am–5pm Monday–Saturday.' },
    { key: 'q2', label: 'Question 2', placeholder: 'Do you deliver?' },
    { key: 'a2', label: 'Answer 2', placeholder: 'Yes, we deliver within Lagos.' },
    { key: 'q3', label: 'Question 3 (optional)', placeholder: 'How do I pay?' },
    { key: 'a3', label: 'Answer 3 (optional)', placeholder: 'We accept cash, bank transfer, and POS.' },
  ],
  // ── Previously missing block types — now added ──────────────────────────
  gallery:      [
    { key: 'title', label: 'Gallery title', placeholder: 'Our Work' },
    { key: 'image1', label: 'Image 1 URL', placeholder: 'https://...' },
    { key: 'caption1', label: 'Image 1 caption', placeholder: 'Before and after' },
    { key: 'image2', label: 'Image 2 URL (optional)', placeholder: 'https://...' },
    { key: 'caption2', label: 'Image 2 caption (optional)', placeholder: '' },
    { key: 'image3', label: 'Image 3 URL (optional)', placeholder: 'https://...' },
    { key: 'caption3', label: 'Image 3 caption (optional)', placeholder: '' },
  ],
  testimonials: [
    { key: 'name1', label: 'Customer 1 name', placeholder: 'Adaeze O.' },
    { key: 'text1', label: 'Customer 1 review', placeholder: 'Excellent service, highly recommend!' },
    { key: 'stars1', label: 'Rating (1–5)', placeholder: '5', type: 'number' },
    { key: 'name2', label: 'Customer 2 name (optional)', placeholder: 'Emeka B.' },
    { key: 'text2', label: 'Customer 2 review (optional)', placeholder: 'Very professional and timely.' },
    { key: 'stars2', label: 'Rating (1–5)', placeholder: '5', type: 'number' },
  ],
  video_embed:  [
    { key: 'videoUrl', label: 'YouTube or Vimeo URL', placeholder: 'https://youtube.com/watch?v=...' },
    { key: 'title', label: 'Video title', placeholder: 'Watch our introduction video' },
    { key: 'description', label: 'Short description (optional)', placeholder: 'See how we work.' },
  ],
  blog_post:    [
    { key: 'title', label: 'Post title', placeholder: 'New products now available!' },
    { key: 'date', label: 'Publish date', placeholder: 'May 2026', type: 'text' },
    { key: 'summary', label: 'Post summary', placeholder: 'We just added 10 new products to our catalogue…' },
    { key: 'readMoreUrl', label: 'Read more URL (optional)', placeholder: 'https://...' },
  ],
  event_list:   [
    { key: 'event1Name', label: 'Event 1 name', placeholder: 'Grand Opening Sale' },
    { key: 'event1Date', label: 'Event 1 date', placeholder: 'June 15, 2026' },
    { key: 'event1Location', label: 'Event 1 location', placeholder: 'Our Lagos Store' },
    { key: 'event2Name', label: 'Event 2 name (optional)', placeholder: 'Workshop' },
    { key: 'event2Date', label: 'Event 2 date (optional)', placeholder: '' },
    { key: 'event2Location', label: 'Event 2 location (optional)', placeholder: '' },
  ],
  community:    [
    { key: 'groupName', label: 'Community / group name', placeholder: 'Adaeze Farms Customer Club' },
    { key: 'description', label: 'What is this community about?', placeholder: 'Join our loyal customer group for exclusive deals.' },
    { key: 'joinUrl', label: 'Join link or WhatsApp group URL', placeholder: 'https://chat.whatsapp.com/...' },
    { key: 'memberCount', label: 'Member count (optional)', placeholder: '250' },
  ],
  social_feed:  [
    { key: 'platform', label: 'Platform (instagram / twitter / tiktok)', placeholder: 'instagram' },
    { key: 'handle', label: 'Handle (without @)', placeholder: 'yourbusiness' },
    { key: 'displayCount', label: 'Number of posts to show', placeholder: '6' },
  ],
  countdown:    [
    { key: 'title', label: 'Countdown title', placeholder: 'Grand Opening in:' },
    { key: 'targetDate', label: 'Target date (ISO format)', placeholder: '2026-12-31', type: 'date' },
    { key: 'subtitle', label: 'Subtitle after countdown', placeholder: 'Join us for special opening discounts!' },
  ],
  trust_badges: [
    { key: 'badge1', label: 'Badge / Certification 1', placeholder: 'CAC Registered Business' },
    { key: 'badge2', label: 'Badge / Certification 2', placeholder: 'NDPR Compliant' },
    { key: 'badge3', label: 'Badge / Certification 3 (optional)', placeholder: 'ISO 9001 Certified' },
    { key: 'badge4', label: 'Badge / Certification 4 (optional)', placeholder: '10+ Years in Business' },
    { key: 'badge5', label: 'Badge / Certification 5 (optional)', placeholder: '' },
  ],
};

function BlockEditModal({
  block,
  onSave,
  onClose,
  saving,
}: {
  block: WakaBlock;
  onSave: (id: string, config: Record<string, string>) => void;
  onClose: () => void;
  saving: boolean;
}) {
  const fields = BLOCK_FIELDS[block.blockType] ?? [];
  const initialConfig: Record<string, string> = (() => {
    try { return JSON.parse(block.configJson) as Record<string, string>; } catch { return {}; }
  })();
  const [config, setConfig] = useState<Record<string, string>>(initialConfig);

  if (fields.length === 0) {
    return (
      <div style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16,
      }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div style={{ background: '#fff', borderRadius: 16, padding: 28, maxWidth: 380, width: '100%', textAlign: 'center' }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No editable fields</h2>
          <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 20 }}>This block type has no configurable fields yet.</p>
          <button onClick={onClose} style={{ padding: '10px 24px', background: '#f3f4f6', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer' }}>Close</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 16,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, maxWidth: 460, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#111827', marginBottom: 16 }}>
          Edit — {BLOCK_TYPES[block.blockType] ?? block.blockType}
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 20 }}>
          {fields.map(f => (
            <div key={f.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{f.label}</label>
              <input
                type={f.type ?? 'text'}
                value={config[f.key] ?? ''}
                onChange={e => setConfig(prev => ({ ...prev, [f.key]: e.target.value }))}
                placeholder={f.placeholder}
                style={{ border: '1.5px solid #d1d5db', borderRadius: 8, padding: '10px 14px', fontSize: 14, minHeight: 44 }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 18px', border: '1.5px solid #e5e7eb', borderRadius: 8, background: '#fff', fontWeight: 600, cursor: 'pointer', fontSize: 14, minHeight: 44 }}>Cancel</button>
          <button
            onClick={() => onSave(block.id, config)}
            disabled={saving}
            style={{ padding: '10px 20px', border: 'none', borderRadius: 8, background: saving ? '#9ca3af' : '#0F4C81', color: '#fff', fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer', fontSize: 14, minHeight: 44 }}
          >
            {saving ? 'Saving…' : 'Save block'}
          </button>
        </div>
      </div>
    </div>
  );
}

function BlockCard({
  block,
  onToggle,
  onDelete,
  onEdit,
  onMoveUp,
  onMoveDown,
  isFirst,
  isLast,
}: {
  block: WakaBlock;
  onToggle: (id: string, visible: boolean) => void;
  onDelete: (id: string) => void;
  onEdit: (block: WakaBlock) => void;
  onMoveUp: (id: string) => void;
  onMoveDown: (id: string) => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '12px 16px',
      background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10,
      flexWrap: 'wrap',
    }}>
      {/* Move up/down controls */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0 }}>
        <button
          onClick={() => onMoveUp(block.id)}
          disabled={isFirst}
          aria-label={`Move ${BLOCK_TYPES[block.blockType] ?? block.blockType} up`}
          style={{
            width: 22, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isFirst ? '#f9fafb' : '#f0f9ff', border: '1px solid #bfdbfe',
            borderRadius: 4, cursor: isFirst ? 'default' : 'pointer', fontSize: 10,
            color: isFirst ? '#d1d5db' : '#0F4C81', padding: 0,
          }}
        >▲</button>
        <button
          onClick={() => onMoveDown(block.id)}
          disabled={isLast}
          aria-label={`Move ${BLOCK_TYPES[block.blockType] ?? block.blockType} down`}
          style={{
            width: 22, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: isLast ? '#f9fafb' : '#f0f9ff', border: '1px solid #bfdbfe',
            borderRadius: 4, cursor: isLast ? 'default' : 'pointer', fontSize: 10,
            color: isLast ? '#d1d5db' : '#0F4C81', padding: 0,
          }}
        >▼</button>
      </div>

      <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: '#111827', minWidth: 120 }}>
        {BLOCK_TYPES[block.blockType] ?? block.blockType}
        {!block.isVisible && (
          <span style={{ marginLeft: 8, fontSize: 11, color: '#9ca3af', fontWeight: 400 }}>(hidden)</span>
        )}
      </span>
      <button
        onClick={() => onEdit(block)}
        style={{ background: '#f0f9ff', border: '1px solid #bfdbfe', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#0F4C81', fontWeight: 600 }}
      >
        Edit
      </button>
      <button
        onClick={() => onToggle(block.id, !block.isVisible)}
        style={{ background: 'none', border: '1px solid #d1d5db', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: block.isVisible ? '#374151' : '#9ca3af' }}
      >
        {block.isVisible ? 'Hide' : 'Show'}
      </button>
      <button
        onClick={() => onDelete(block.id)}
        style={{ background: 'none', border: '1px solid #fca5a5', borderRadius: 6, padding: '4px 10px', fontSize: 12, cursor: 'pointer', color: '#ef4444' }}
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
  // H3: Block editing
  const [editingBlock, setEditingBlock] = useState<WakaBlock | null>(null);
  const [savingBlockConfig, setSavingBlockConfig] = useState(false);

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
        // Pre-fetch QR URL for published pages so the "View Live" button is immediately available
        if (first.publicationState === 'published') {
          api.get<QrResponse>(`/v0/wakapages/${first.id}/qr`)
            .then(data => setQr(data))
            .catch(() => { /* non-fatal */ });
        }
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

  // Block reordering — optimistic local sort + API PATCH
  const handleMoveBlock = async (blockId: string, direction: 'up' | 'down') => {
    if (!page) return;
    const sorted = [...blocks].sort((a, b) => a.sortOrder - b.sortOrder);
    const idx = sorted.findIndex(b => b.id === blockId);
    if (idx < 0) return;
    const swapIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;

    // Swap sortOrder values
    const aOrder = sorted[idx].sortOrder;
    const bOrder = sorted[swapIdx].sortOrder;
    const updatedA = { ...sorted[idx], sortOrder: bOrder };
    const updatedB = { ...sorted[swapIdx], sortOrder: aOrder };

    // Optimistic update
    setBlocks(prev => prev.map(b => {
      if (b.id === updatedA.id) return updatedA;
      if (b.id === updatedB.id) return updatedB;
      return b;
    }));

    // Persist both changes
    try {
      await Promise.all([
        api.patch(`/v0/wakapages/${page.id}/blocks/${updatedA.id}`, { sort_order: updatedA.sortOrder }),
        api.patch(`/v0/wakapages/${page.id}/blocks/${updatedB.id}`, { sort_order: updatedB.sortOrder }),
      ]);
    } catch {
      // Revert on failure
      setBlocks(prev => prev.map(b => {
        if (b.id === sorted[idx].id) return sorted[idx];
        if (b.id === sorted[swapIdx].id) return sorted[swapIdx];
        return b;
      }));
      toast.error('Could not reorder blocks. Please try again.');
    }
  };

  // H3: Save block config
  const handleSaveBlockConfig = async (blockId: string, config: Record<string, string>) => {
    if (!page) return;
    setSavingBlockConfig(true);
    try {
      await api.patch(`/v0/wakapages/${page.id}/blocks/${blockId}`, {
        config_json: JSON.stringify(config),
      });
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, configJson: JSON.stringify(config) } : b));
      toast.success('Block content saved!');
      setEditingBlock(null);
    } catch {
      toast.error('Could not save block content. Please try again.');
    } finally {
      setSavingBlockConfig(false);
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
      {editingBlock && (
        <BlockEditModal
          block={editingBlock}
          onSave={(id, config) => void handleSaveBlockConfig(id, config)}
          onClose={() => setEditingBlock(null)}
          saving={savingBlockConfig}
        />
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
          {page.publicationState === 'published' && qr?.publicUrl && (
            <a
              href={qr.publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#059669', color: '#fff', fontSize: 14, fontWeight: 600,
                padding: '10px 18px', borderRadius: 8, textDecoration: 'none', minHeight: 40,
              }}
            >
              🌐 View Live Page
            </a>
          )}
          {page.publicationState === 'published' && !qr?.publicUrl && (
            <Button
              onClick={() => void handleShowQr()}
              disabled={loadingQr}
              style={{ background: '#059669', color: '#fff', fontSize: 14 }}
            >
              {loadingQr ? 'Loading…' : '🌐 View Live Page'}
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
              .map((block, idx, arr) => (
                <BlockCard
                  key={block.id}
                  block={block}
                  onToggle={(id, vis) => void handleToggleBlock(id, vis)}
                  onDelete={(id) => void handleDeleteBlock(id)}
                  onEdit={(b) => setEditingBlock(b)}
                  onMoveUp={(id) => void handleMoveBlock(id, 'up')}
                  onMoveDown={(id) => void handleMoveBlock(id, 'down')}
                  isFirst={idx === 0}
                  isLast={idx === arr.length - 1}
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
