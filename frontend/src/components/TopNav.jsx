import { useAppState, useAppActions } from "../state/store.jsx";

const TABS = [
  { id: "reminders", label: "Reminders" },
  { id: "providers", label: "Find a Provider" },
  { id: "chat", label: "Schedule" },
];

export default function TopNav() {
  const { activeTab } = useAppState();
  const { setTab } = useAppActions();

  return (
    <header className="border-b border-border-soft bg-surface">
      <div className="mx-auto max-w-5xl px-6 py-5 flex items-baseline justify-between gap-6">
        <div className="flex items-baseline gap-3">
          <span
            aria-hidden="true"
            className="inline-block h-3 w-3 rounded-full bg-accent"
          />
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            NeuroSync Health
          </h1>
        </div>
        <nav aria-label="Primary">
          <ul className="flex items-center gap-2">
            {TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => setTab(tab.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={
                      "px-4 py-2 rounded-full text-base transition-colors duration-200 " +
                      (isActive
                        ? "bg-accent text-accent-on"
                        : "text-ink-secondary hover:bg-subtle")
                    }
                  >
                    {tab.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
