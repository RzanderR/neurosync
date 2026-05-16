import { useState } from "react";

export default function ChatComposer({
  chips,
  allowFreeText,
  freeTextPlaceholder,
  disabled,
  onAnswer,
}) {
  const [draft, setDraft] = useState("");

  function submitFreeText(e) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed || disabled) return;
    onAnswer({ label: trimmed, value: trimmed, source: "free_text" });
    setDraft("");
  }

  return (
    <div className="border-t border-border-soft bg-surface px-6 py-5 space-y-4">
      {chips && chips.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {chips.map((chip) => (
            <button
              key={chip.value}
              type="button"
              disabled={disabled}
              onClick={() => onAnswer({ ...chip, source: "chip" })}
              className="px-4 py-2 rounded-full border border-border-strong bg-canvas text-ink hover:bg-accent-soft hover:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {chip.label}
            </button>
          ))}
        </div>
      )}

      {allowFreeText && (
        <form onSubmit={submitFreeText} className="flex items-center gap-3">
          <label htmlFor="chat-input" className="sr-only">
            Type your answer
          </label>
          <input
            id="chat-input"
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={freeTextPlaceholder ?? "Type here..."}
            disabled={disabled}
            className="flex-1 px-5 py-3 rounded-full bg-canvas border border-border-strong text-ink placeholder:text-ink-muted disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || draft.trim().length === 0}
            className="px-5 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover disabled:bg-subtle disabled:text-ink-muted transition-colors duration-200"
          >
            Send
          </button>
        </form>
      )}
    </div>
  );
}
