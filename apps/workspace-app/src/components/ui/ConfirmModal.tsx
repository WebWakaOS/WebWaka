/**
 * ConfirmModal — accessible in-app confirmation dialog.
 * Replaces window.confirm() for destructive actions.
 * Now includes:
 *  - focus trap (Tab/Shift+Tab stay inside modal)
 *  - ESC to cancel
 *  - auto-focus confirm button on open
 *  - CSS custom properties for dark mode
 */
import { useEffect, useRef } from 'react';

interface Props {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  danger = false,
  onConfirm,
  onCancel,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const cancelBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;

    // Store previously focused element
    lastFocused.current = document.activeElement;

    // Auto-focus cancel button on open (safer UX — avoids accidental confirm)
    setTimeout(() => cancelBtnRef.current?.focus(), 0);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
        return;
      }
      if (e.key !== 'Tab') return;

      const el = dialogRef.current;
      if (!el) return;

      const focusable = Array.from(
        el.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')
      );
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      // Restore focus on close
      (lastFocused.current as HTMLElement)?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 16,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div
        ref={dialogRef}
        style={{
          background: 'var(--ww-surface, #fff)',
          borderRadius: 'var(--ww-radius-lg, 14px)',
          padding: '28px 24px',
          maxWidth: 400,
          width: '100%',
          boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
          border: '1px solid var(--ww-border, #e5e7eb)',
        }}
      >
        <h2
          id="confirm-modal-title"
          style={{ fontSize: 18, fontWeight: 700, color: 'var(--ww-text, #111827)', marginBottom: 10 }}
        >
          {title}
        </h2>
        <p
          id="confirm-modal-desc"
          style={{ fontSize: 14, color: 'var(--ww-text-muted, #6b7280)', lineHeight: 1.6, marginBottom: 24 }}
        >
          {message}
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button
            ref={cancelBtnRef}
            onClick={onCancel}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--ww-radius, 8px)',
              border: '1.5px solid var(--ww-border, #e5e7eb)',
              background: 'var(--ww-surface, #fff)',
              color: 'var(--ww-text, #374151)',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            onClick={onConfirm}
            style={{
              padding: '10px 18px',
              borderRadius: 'var(--ww-radius, 8px)',
              border: 'none',
              background: danger ? 'var(--ww-danger, #ef4444)' : 'var(--ww-primary, #0F4C81)',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
