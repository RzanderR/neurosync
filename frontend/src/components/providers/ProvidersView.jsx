import { useEffect } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import { fetchProviders } from "../../lib/api.js";
import { findTypeBySpecialty } from "../../lib/chatFlow.js";
import ProviderCard from "./ProviderCard.jsx";

export default function ProvidersView() {
  const { providers, providersLoading, providersError } = useAppState();
  const {
    setProviders,
    setProvidersError,
    setTab,
    setChatStep,
    setChatContext,
    addChatBubble,
  } = useAppActions();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchProviders();
        if (!cancelled) setProviders(list);
      } catch (err) {
        console.error("Failed to load providers", err);
        if (!cancelled) setProvidersError(err.message ?? "Could not load providers");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setProviders, setProvidersError]);

  function handleSchedule(provider) {
    const appointmentType =
      findTypeBySpecialty(provider.specialty) ?? `${provider.specialty} visit`;

    setChatContext({
      clinicId: provider.id,
      appointmentType,
    });
    setChatStep("PICK_TIMEFRAME");
    addChatBubble({
      id: `bubble-seed-${Date.now()}`,
      kind: "assistant",
      text:
        `Great — let's set up a ${appointmentType.toLowerCase()} with ${provider.name}. ` +
        `When would you like to be seen?`,
    });
    setTab("chat");
  }

  return (
    <section aria-labelledby="providers-heading" className="space-y-6">
      <div>
        <h2 id="providers-heading" className="m-0 text-3xl text-ink">
          Find a provider
        </h2>
        <p className="m-0 mt-2 text-lg text-ink-secondary">
          Providers near you with experience supporting TBI patients.
        </p>
      </div>

      {providersLoading && (
        <div className="bg-surface border border-border-soft rounded-2xl p-8">
          <p className="m-0 text-ink-secondary">Loading providers…</p>
        </div>
      )}

      {providersError && (
        <div className="bg-error-bg text-error-text border border-border-soft rounded-2xl p-6">
          <p className="m-0">{providersError}</p>
        </div>
      )}

      {!providersLoading && !providersError && providers.length === 0 && (
        <div className="bg-surface border border-border-soft rounded-2xl p-8">
          <p className="m-0 text-ink-secondary">No providers available right now.</p>
        </div>
      )}

      {providers.length > 0 && (
        <ul className="grid gap-6 sm:grid-cols-2">
          {providers.map((provider) => (
            <li key={provider.id}>
              <ProviderCard provider={provider} onSchedule={handleSchedule} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
