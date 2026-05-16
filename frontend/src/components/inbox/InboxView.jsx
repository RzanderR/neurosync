import { useEffect, useMemo, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import MessageList from "./MessageList.jsx";
import MessageDetail from "./MessageDetail.jsx";

export default function InboxView() {
  const { messages } = useAppState();
  const { updateMessage } = useAppActions();
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? null);

  useEffect(() => {
    if (!selectedId && messages.length > 0) {
      setSelectedId(messages[0].id);
    }
  }, [messages, selectedId]);

  useEffect(() => {
    if (!selectedId) return;
    const msg = messages.find((m) => m.id === selectedId);
    if (msg?.unread) updateMessage(selectedId, { unread: false });
  }, [selectedId, messages, updateMessage]);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) ?? null,
    [messages, selectedId]
  );

  return (
    <section
      aria-labelledby="inbox-heading"
      className="bg-surface border border-border-soft rounded-2xl overflow-hidden h-[calc(100svh-10rem)] min-h-[32rem] grid md:grid-cols-[20rem_1fr]"
    >
      <h2 id="inbox-heading" className="sr-only">
        Inbox
      </h2>

      <aside className="border-b md:border-b-0 md:border-r border-border-soft overflow-y-auto bg-canvas">
        <header className="px-5 py-4 border-b border-border-soft bg-surface">
          <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">Inbox</p>
          <p className="m-0 mt-1 text-base text-ink">
            {messages.length} message{messages.length === 1 ? "" : "s"}
          </p>
        </header>
        <MessageList
          messages={messages}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
      </aside>

      <div className="overflow-hidden">
        {selected ? (
          <MessageDetail message={selected} />
        ) : (
          <div className="p-8">
            <p className="m-0 text-ink-secondary">Pick a message to read it.</p>
          </div>
        )}
      </div>
    </section>
  );
}
