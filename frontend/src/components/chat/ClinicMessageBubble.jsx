import { useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import { rewriteMessage } from "../../lib/api.js";

export default function ClinicMessageBubble({ messageId }) {
  const { messages, patient } = useAppState();
  const { updateMessage } = useAppActions();
  const message = messages.find((m) => m.id === messageId);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  if (!message) return null;

  async function handleTranslate() {
    setBusy(true);
    setError(null);
    try {
      const { rewritten } = await rewriteMessage({
        rawMessage: message.body,
        patient: {
          id: patient.id,
          firstName: patient.firstName,
          accessibilityProfile: patient.accessibilityProfile,
        },
      });
      updateMessage(message.id, { rewritten });
    } catch (err) {
      console.error("Rewrite failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-notice-bg text-notice-text text-sm font-semibold"
      >
        ✉︎
      </span>
      <div className="flex-1 max-w-3xl bg-surface border border-border-soft rounded-2xl rounded-tl-sm overflow-hidden">
        <header className="px-6 py-4 bg-subtle border-b border-border-soft">
          <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
            New message from {message.from}
          </p>
          <p className="m-0 mt-1 text-base text-ink font-medium">{message.subject}</p>
        </header>

        <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-soft">
          <section className="p-6">
            <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
              What they wrote
            </p>
            <pre className="m-0 mt-3 whitespace-pre-wrap font-sans text-base text-ink-secondary leading-relaxed">
              {message.body}
            </pre>
          </section>

          <section className="p-6 bg-canvas">
            <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
              In plain language
            </p>
            {message.rewritten ? (
              <pre className="m-0 mt-3 whitespace-pre-wrap font-sans text-base text-ink leading-relaxed">
                {message.rewritten}
              </pre>
            ) : (
              <div className="mt-3 flex flex-col items-start gap-3">
                <p className="m-0 text-base text-ink-secondary">
                  I can rewrite this in clear language with the action items pulled to the top.
                </p>
                <button
                  type="button"
                  onClick={handleTranslate}
                  disabled={busy}
                  className="px-5 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover disabled:bg-subtle disabled:text-ink-muted transition-colors duration-200"
                >
                  {busy ? "Translating…" : "Plain language"}
                </button>
                {error && (
                  <p className="m-0 text-base text-error-text">{error}</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
