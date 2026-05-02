/**
 * BioGeneratorButton — Wave 3 A7-4
 * "Generate Bio" button for Brand Settings page.
 * Calls POST /superagent/chat with capability=bio_generator.
 */
import React, { useState, useCallback } from 'react';
import { AIInsightWidget } from '../AIInsightWidget.js';

export interface BioGeneratorButtonProps {
  workspaceId: string;
  businessName: string;
  vertical: string;
  onApply?: (bio: string) => void;
  apiBaseUrl?: string;
}

export const BioGeneratorButton: React.FC<BioGeneratorButtonProps> = ({
  workspaceId, businessName, vertical, onApply, apiBaseUrl = '',
}) => {
  const [bio, setBio] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const generate = useCallback(async () => {
    setLoading(true); setError(undefined);
    try {
      const res = await fetch(`${apiBaseUrl}/superagent/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          capability: 'bio_generator', workspaceId,
          message: `Write a professional business bio for ${businessName}, a ${vertical} business. Keep it under 100 words.`,
        }),
      });
      if (!res.ok) throw new Error(`AI error: HTTP ${res.status}`);
      const data = await res.json() as { reply: string };
      setBio(data.reply);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bio generation failed');
    } finally {
      setLoading(false);
    }
  }, [workspaceId, businessName, vertical, apiBaseUrl]);

  return (
    <div className="space-y-3">
      <button onClick={generate} disabled={loading}
              className="text-xs font-medium px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition">
        {loading ? 'Generating…' : '✨ Generate Bio'}
      </button>
      {(loading || bio || error) && (
        <AIInsightWidget
          capability="bio_generator" title="AI-Generated Bio"
          content={bio} loading={loading} error={error}
          onApply={onApply} onRetry={generate}
          onDismiss={() => { setBio(undefined); setError(undefined); }}
          variant="suggestion"
        />
      )}
    </div>
  );
};
