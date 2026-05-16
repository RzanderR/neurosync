export default function UserBubble({ text }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-2xl bg-accent-soft border border-border-soft rounded-2xl rounded-tr-sm px-6 py-4">
        <p className="m-0 text-base text-ink whitespace-pre-wrap">{text}</p>
      </div>
    </div>
  );
}
