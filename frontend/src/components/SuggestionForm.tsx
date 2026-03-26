import { useState } from 'react';

export function SuggestionForm({
  onSubmit
}: {
  onSubmit: (input: { contactName?: string; message: string; proposedContent: string }) => Promise<void>;
}) {
  const [contactName, setContactName] = useState('');
  const [message, setMessage] = useState('');
  const [proposedContent, setProposedContent] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setStatus(null);

    try {
      await onSubmit({ contactName, message, proposedContent });
      setContactName('');
      setMessage('');
      setProposedContent('');
      setStatus('Suggestion submitted.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to submit suggestion.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-panel dark:border-stone-800 dark:bg-stone-900">
      <div>
        <h3 className="text-base font-semibold">Suggest a correction</h3>
        <p className="mt-1 text-sm text-stone-600 dark:text-stone-300">Use this if you spot a typo or wrong chord.</p>
      </div>
      <input
        value={contactName}
        onChange={(event) => setContactName(event.target.value)}
        placeholder="Your name (optional)"
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
      />
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        placeholder="What should be corrected?"
        rows={3}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 dark:border-stone-700 dark:bg-stone-950"
        required
      />
      <textarea
        value={proposedContent}
        onChange={(event) => setProposedContent(event.target.value)}
        placeholder="Optional corrected chord block"
        rows={6}
        className="w-full rounded-2xl border border-stone-200 px-4 py-3 font-mono dark:border-stone-700 dark:bg-stone-950"
        required
      />
      {status ? <p className="text-sm text-stone-600 dark:text-stone-300">{status}</p> : null}
      <button
        type="submit"
        disabled={isSaving}
        className="rounded-2xl bg-brand-700 px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
      >
        {isSaving ? 'Submitting...' : 'Submit correction'}
      </button>
    </form>
  );
}
