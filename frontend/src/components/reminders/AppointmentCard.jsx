const STATUS_STYLES = {
  scheduled: {
    label: "Scheduled",
    pill: "bg-status-scheduled-bg text-status-scheduled-text",
  },
  in_progress: {
    label: "Awaiting clinic",
    pill: "bg-status-progress-bg text-status-progress-text",
  },
  pending: {
    label: "Pending",
    pill: "bg-status-pending-bg text-status-pending-text",
  },
};

export default function AppointmentCard({ appointment, onSelect }) {
  const status = STATUS_STYLES[appointment.status] ?? STATUS_STYLES.pending;
  const primaryLine =
    appointment.status === "scheduled"
      ? appointment.appointmentTime
      : "Drafted email — awaiting clinic reply";

  return (
    <button
      type="button"
      onClick={() => onSelect(appointment)}
      className="w-full text-left bg-canvas border border-border-soft rounded-2xl p-6 transition-colors duration-200 hover:bg-subtle focus-visible:bg-subtle"
    >
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-xl text-ink m-0">{appointment.clinic.name}</h3>
          <p className="m-0 mt-1 text-base text-ink-secondary">
            {appointment.clinic.specialty} · {appointment.appointmentType}
          </p>
        </div>
        <span
          className={
            "shrink-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium " +
            status.pill
          }
        >
          {status.label}
        </span>
      </div>
      <p className="m-0 mt-5 text-lg text-ink">{primaryLine}</p>
      {appointment.status === "scheduled" && appointment.location && (
        <p className="m-0 mt-1 text-base text-ink-secondary">{appointment.location}</p>
      )}
    </button>
  );
}
