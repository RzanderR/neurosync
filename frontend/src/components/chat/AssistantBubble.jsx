export default function AssistantBubble({ text }) {
  return (
    <div className="flex items-start gap-4">
      <span
        aria-hidden="true"
        className="mt-1 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-accent text-accent-on text-sm font-semibold"
      >
        NS
      </span>
      <div className="max-w-2xl bg-surface border border-border-soft rounded-2xl rounded-tl-sm px-6 py-4">
        <p className="m-0 text-base text-ink whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
