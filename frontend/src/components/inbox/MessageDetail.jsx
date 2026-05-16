import { useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import { rewriteMessage } from "../../lib/api.js";

export default function MessageDetail({ message }) {
  const { patient } = useAppState();
  const { updateMessage } = useAppActions();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [showPlain, setShowPlain] = useState(Boolean(message.rewritten));

  async function handleTranslate() {
    if (message.rewritten) {
      setShowPlain(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { rewritten } = await rewriteMessage({
        rawMessage: message.body,
        patient: patient
          ? {
              id: patient.id,
              firstName: patient.firstName,
              accessibilityProfile: patient.accessibilityProfile,
            }
          : undefined,
        fallbackRewrite: message.rewritten ?? "",
      });
      updateMessage(message.id, { rewritten });
      setShowPlain(true);
    } catch (err) {
      console.error("Rewrite failed", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="h-full overflow-y-auto">
      <header className="px-8 pt-8 pb-4 border-b border-border-soft">
        <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">From</p>
        <p className="m-0 mt-1 text-lg text-ink">{message.from}</p>
        <h2 className="m-0 mt-3 text-2xl text-ink">{message.subject}</h2>
      </header>

      <div className="px-8 py-6 space-y-6">
        {showPlain ? (
          <section aria-label="Plain language version">
            <div className="flex items-center justify-between gap-4">
              <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
                In plain language
              </p>
              <button
                type="button"
                onClick={() => setShowPlain(false)}
                className="text-sm text-ink-secondary hover:text-ink px-3 py-1 rounded-full"
              >
                Show original
              </button>
            </div>
            <pre className="m-0 mt-3 whitespace-pre-wrap font-sans text-lg text-ink leading-relaxed bg-success-bg rounded-2xl p-6">
              {message.rewritten}
            </pre>
          </section>
        ) : (
          <section aria-label="Original message">
            <div className="flex items-center justify-between gap-4">
              <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
                Original message
              </p>
              {message.rewritten && (
                <button
                  type="button"
                  onClick={() => setShowPlain(true)}
                  className="text-sm text-ink-secondary hover:text-ink px-3 py-1 rounded-full"
                >
                  Show plain language
                </button>
              )}
            </div>
            <pre className="m-0 mt-3 whitespace-pre-wrap font-sans text-base text-ink-secondary leading-relaxed bg-canvas border border-border-soft rounded-2xl p-6">
              {message.body}
            </pre>
          </section>
        )}

        {!showPlain && (
          <div className="flex flex-col items-start gap-3">
            <p className="m-0 text-base text-ink-secondary">
              I can rewrite this in clear language with the action items at the top.
            </p>
            <button
              type="button"
              onClick={handleTranslate}
              disabled={busy}
              className="px-6 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover disabled:bg-subtle disabled:text-ink-muted transition-colors duration-200"
            >
              {busy ? "Translating…" : "Plain language"}
            </button>
            {error && <p className="m-0 text-base text-error-text">{error}</p>}
          </div>
        )}
      </div>
    </article>
  );
}
