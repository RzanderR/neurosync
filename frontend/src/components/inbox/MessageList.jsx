function relativeTime(iso) {
  const now = Date.now();
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = now - then;
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
}

function snippet(body) {
  if (!body) return "";
  const clean = body.replace(/\s+/g, " ").trim();
  return clean.length > 90 ? `${clean.slice(0, 87)}…` : clean;
}

export default function MessageList({ messages, selectedId, onSelect }) {
  if (messages.length === 0) {
    return (
      <div className="p-6">
        <p className="m-0 text-ink-secondary">No messages yet.</p>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-border-soft" role="list">
      {messages.map((m) => {
        const isSelected = m.id === selectedId;
        return (
          <li key={m.id}>
            <button
              type="button"
              onClick={() => onSelect(m.id)}
              aria-current={isSelected}
              className={
                "w-full text-left px-5 py-4 transition-colors duration-200 " +
                (isSelected ? "bg-accent-soft" : "hover:bg-subtle")
              }
            >
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className={
                    "inline-block h-2 w-2 rounded-full shrink-0 " +
                    (m.unread ? "bg-accent" : "bg-transparent")
                  }
                />
                <p className="m-0 flex-1 text-base text-ink font-medium truncate">
                  {m.from}
                </p>
                <span className="text-sm text-ink-muted shrink-0">
                  {relativeTime(m.receivedAt)}
                </span>
              </div>
              <p className="m-0 mt-1 text-base text-ink truncate">{m.subject}</p>
              <p className="m-0 mt-1 text-sm text-ink-secondary truncate">
                {snippet(m.body)}
              </p>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
