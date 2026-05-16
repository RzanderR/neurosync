export default function AppointmentDetail({ appointment, onClose }) {
  const isScheduled = appointment.status === "scheduled";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="appointment-detail-title"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-ink/30"
      onClick={onClose}
    >
      <div
        className="bg-elevated max-w-xl w-full rounded-2xl p-8 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            <h2
              id="appointment-detail-title"
              className="m-0 text-2xl text-ink"
            >
              {appointment.clinic.name}
            </h2>
            <p className="m-0 mt-1 text-base text-ink-secondary">
              {appointment.clinic.specialty} · {appointment.appointmentType}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close details"
            className="text-ink-secondary hover:text-ink px-3 py-1 rounded-full"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {isScheduled ? (
            <>
              <DetailRow label="When" value={appointment.appointmentTime} />
              <DetailRow label="Where" value={appointment.location ?? appointment.clinic.address} />
              <DetailRow label="Confirmation" value={appointment.confirmationCode} />
              {appointment.clinic.phone && (
                <DetailRow label="Clinic phone" value={appointment.clinic.phone} />
              )}
            </>
          ) : (
            <>
              <DetailRow
                label="Status"
                value="We sent an email to the clinic on your behalf. We'll let you know when they reply."
              />
              <div>
                <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
                  The email we sent
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-base text-ink bg-canvas border border-border-soft rounded-xl p-5">
                  {appointment.emailDraft}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div>
      <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="m-0 mt-1 text-lg text-ink">{value}</p>
    </div>
  );
}
