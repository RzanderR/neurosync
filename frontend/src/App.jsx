import { AppProvider, useAppState } from "./state/store.jsx";
import TopBar from "./components/TopBar.jsx";
import HomeView from "./components/home/HomeView.jsx";
import InboxView from "./components/inbox/InboxView.jsx";
import AccountModal from "./components/account/AccountModal.jsx";

function AppBody() {
  const { view, patient, showAccountModal } = useAppState();
  const showApp = patient != null;

  return (
    <div className="min-h-svh bg-canvas">
      {showApp && <TopBar />}
      <main className="mx-auto max-w-7xl px-6 py-8">
        {showApp ? (
          view === "inbox" ? <InboxView /> : <HomeView />
        ) : (
          <div className="text-center py-20">
            <h1 className="m-0 text-3xl text-ink">Welcome to NeuroSync Health</h1>
            <p className="m-0 mt-3 text-lg text-ink-secondary">
              Just a few quick details so we can set up your appointments.
            </p>
          </div>
        )}
      </main>
      {showAccountModal && <AccountModal />}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppBody />
    </AppProvider>
  );
}
