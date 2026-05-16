import { AppProvider, useAppState } from "./state/store.jsx";
import TopNav from "./components/TopNav.jsx";
import RemindersView from "./components/reminders/RemindersView.jsx";
import ProvidersView from "./components/providers/ProvidersView.jsx";
import ChatView from "./components/chat/ChatView.jsx";

function ActiveView() {
  const { activeTab } = useAppState();
  switch (activeTab) {
    case "reminders":
      return <RemindersView />;
    case "providers":
      return <ProvidersView />;
    case "chat":
      return <ChatView />;
    default:
      return <RemindersView />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <div className="min-h-svh bg-canvas">
        <TopNav />
        <main className="mx-auto max-w-5xl px-6 py-10">
          <ActiveView />
        </main>
      </div>
    </AppProvider>
  );
}
