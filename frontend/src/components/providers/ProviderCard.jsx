export default function ProviderCard({ provider, onSchedule }) {
  return (
    <article className="bg-surface border border-border-soft rounded-2xl p-8 flex flex-col gap-4">
      <div>
        <h3 className="m-0 text-xl text-ink">{provider.name}</h3>
        <p className="m-0 mt-1 text-base text-ink-secondary">{provider.specialty}</p>
      </div>

      <div className="space-y-2">
        <p className="m-0 text-base text-ink">{provider.address}</p>
        <p className="m-0 text-base text-ink-secondary">
          {typeof provider.distanceMiles === "number"
            ? `${provider.distanceMiles.toFixed(1)} miles away`
            : "Distance not available"}
          {provider.acceptsTelehealth ? " · Telehealth available" : ""}
        </p>
        {provider.tbiNotes && (
          <p className="m-0 text-base text-accent">
            <span aria-hidden="true">★ </span>
            {provider.tbiNotes}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => onSchedule(provider)}
        className="mt-2 self-start px-5 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover transition-colors duration-200"
      >
        Schedule with this provider
      </button>
    </article>
  );
}
