/**
 * AriaLiveRegion — persistent live region for screen reader announcements.
 * Mount once in App.tsx. Registers itself with the toast module so all toast
 * messages are reliably announced to screen readers.
 *
 * Pattern: one persistent DOM element rather than per-toast aria-live attributes.
 * This is more reliable across NVDA, JAWS, VoiceOver, and TalkBack.
 */
import { useEffect, useRef } from 'react';
import { registerLiveAnnouncer } from '@/lib/toast';

export function AriaLiveRegion() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const announce = (msg: string) => {
      const el = ref.current;
      if (!el) return;
      // Clear and re-set forces re-announcement even for identical messages
      el.textContent = '';
      requestAnimationFrame(() => {
        if (ref.current) ref.current.textContent = msg;
      });
    };

    // Register with the toast module
    const unregister = registerLiveAnnouncer(announce);
    return unregister;
  }, []);

  return (
    <div
      ref={ref}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0,0,0,0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    />
  );
}
