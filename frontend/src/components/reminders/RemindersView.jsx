import { useMemo, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
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

export default function RemindersView() {
  const { appointments } = useAppState();
  const { setTab } = useAppActions();
  const [selectedId, setSelectedId] = useState(null);

  const upcoming = useMemo(() => {
    return appointments
      .filter((a) => a.status === "scheduled" || a.status === "in_progress")
      .sort((a, b) => sortKey(a) - sortKey(b));
  }, [appointments]);

  const selected = upcoming.find((a) => a.id === selectedId) ?? null;

  return (
    <section aria-labelledby="reminders-heading" className="space-y-6">
      <div>
        <h2 id="reminders-heading" className="m-0 text-3xl text-ink">
          Your reminders
        </h2>
        <p className="m-0 mt-2 text-lg text-ink-secondary">
          Upcoming appointments and the ones we're still arranging.
        </p>
      </div>

      {upcoming.length === 0 ? (
        <div className="bg-surface border border-border-soft rounded-2xl p-10 text-center">
          <p className="m-0 text-lg text-ink-secondary">
            Nothing scheduled yet.
          </p>
          <button
            type="button"
            onClick={() => setTab("chat")}
            className="mt-6 inline-flex items-center px-5 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover transition-colors duration-200"
          >
            Book your first appointment
          </button>
        </div>
      ) : (
        <ul className="grid gap-6">
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
        <AppointmentDetail appointment={selected} onClose={() => setSelectedId(null)} />
      )}
    </section>
  );
}
