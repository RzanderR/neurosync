import { useMemo, useState } from "react";
import { useAppState } from "../../state/store.jsx";
import AppointmentCard from "./AppointmentCard.jsx";
import AppointmentDetail from "./AppointmentDetail.jsx";

function sortKey(a) {
  if (a.status === "scheduled" && a.appointmentTime) {
    return new Date(a.appointmentTime).getTime() || 0;
  }
  if (a.awaitingResponseSince) {
    return new Date(a.awaitingResponseSince).getTime();
  }
  return new Date(a.updatedAt ?? 0).getTime();
}

export default function RemindersView({ compact = false }) {
  const { appointments } = useAppState();
  const [selectedId, setSelectedId] = useState(null);

  const upcoming = useMemo(() => {
    return appointments
      .filter((a) => a.status === "scheduled" || a.status === "in_progress")
      .sort((a, b) => sortKey(a) - sortKey(b));
  }, [appointments]);

  const selected = upcoming.find((a) => a.id === selectedId) ?? null;

  return (
    <section
      aria-labelledby="reminders-heading"
      className={compact ? "" : "space-y-6"}
    >
      <header className="flex items-baseline justify-between gap-4">
        <div>
          <h2
            id="reminders-heading"
            className={compact ? "m-0 text-2xl text-ink" : "m-0 text-3xl text-ink"}
          >
            Upcoming appointments
          </h2>
          <p className="m-0 mt-1 text-base text-ink-secondary">
            Everything you've booked, and the ones we're still arranging.
          </p>
        </div>
        <p className="m-0 text-sm text-ink-muted whitespace-nowrap">
          {upcoming.length} active
        </p>
      </header>

      {upcoming.length === 0 ? (
        <div className="mt-4 bg-canvas border border-border-soft rounded-2xl p-8 text-center">
          <p className="m-0 text-base text-ink-secondary">
            Nothing scheduled yet. Use the chat below to book your first appointment.
          </p>
        </div>
      ) : (
        <ul
          className={
            compact
              ? "mt-4 grid sm:grid-cols-2 gap-4"
              : "grid gap-6"
          }
        >
          {upcoming.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentCard
                appointment={appointment}
                onSelect={(a) => setSelectedId(a.id)}
              />
            </li>
          ))}
        </ul>
      )}

      {selected && (
        <AppointmentDetail
          appointment={selected}
          onClose={() => setSelectedId(null)}
        />
      )}
    </section>
  );
}
