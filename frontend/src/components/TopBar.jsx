import { useAppState, useAppActions } from "../state/store.jsx";
import AccountMenu from "./account/AccountMenu.jsx";

function MailIcon({ unreadCount, isInbox, onClick }) {
  const label = isInbox ? "Back to home" : "Open inbox";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className="relative inline-flex items-center justify-center h-11 w-11 rounded-full border border-border-soft bg-canvas hover:bg-subtle transition-colors duration-200"
    >
      {isInbox ? (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-ink"
        >
          <path d="M19 12H5" />
          <path d="M12 19l-7-7 7-7" />
        </svg>
      ) : (
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 text-ink"
        >
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 7l9 6 9-6" />
        </svg>
      )}
      {!isInbox && unreadCount > 0 && (
        <span
          aria-label={`${unreadCount} unread`}
          className="absolute -top-1 -right-1 min-w-5 h-5 px-1 inline-flex items-center justify-center rounded-full bg-accent text-accent-on text-xs font-semibold"
        >
          {unreadCount}
        </span>
      )}
    </button>
  );
}

export default function TopBar() {
  const { view, messages, patient } = useAppState();
  const { setView } = useAppActions();
  const isInbox = view === "inbox";
  const unreadCount = messages.filter((m) => m.unread).length;

  return (
    <header className="border-b border-border-soft bg-surface">
      <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="inline-block h-3 w-3 rounded-full bg-accent" />
          <h1 className="m-0 text-2xl font-semibold tracking-tight text-ink">
            NeuroSync Health
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {patient && <AccountMenu />}
          <MailIcon
            isInbox={isInbox}
            unreadCount={unreadCount}
            onClick={() => setView(isInbox ? "home" : "inbox")}
          />
        </div>
      </div>
    </header>
  );
}
