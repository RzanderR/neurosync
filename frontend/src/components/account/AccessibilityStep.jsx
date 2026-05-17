const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "no_preference", label: "No preference" },
];

function Toggle({ checked, onChange, label }) {
  return (
    <label className="flex items-center gap-3 p-3 rounded-xl border border-border-soft bg-canvas cursor-pointer hover:bg-subtle transition-colors duration-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-5 w-5 accent-accent"
      />
      <span className="text-base text-ink">{label}</span>
    </label>
  );
}

export default function AccessibilityStep({ values, onChange }) {
  function setKey(key, value) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-3">
        <Toggle
          checked={values.writtenCommunicationOnly}
          onChange={(v) => setKey("writtenCommunicationOnly", v)}
          label="Email only — no phone calls"
        />
        <Toggle
          checked={values.lowStimulationRequested}
          onChange={(v) => setKey("lowStimulationRequested", v)}
          label="Low-stimulation environment"
        />
        <Toggle
          checked={values.supportPersonAttending}
          onChange={(v) => setKey("supportPersonAttending", v)}
          label="Bringing a support person"
        />
        <Toggle
          checked={values.transportationConstraint}
          onChange={(v) => setKey("transportationConstraint", v)}
          label="Transportation constraints"
        />
      </div>

      <fieldset>
        <legend className="text-sm uppercase tracking-wide text-ink-muted">
          Preferred time
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TIME_OPTIONS.map((opt) => {
            const selected = values.preferredTimeOfDay === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setKey("preferredTimeOfDay", opt.value)}
                aria-pressed={selected}
                className={
                  "px-4 py-2 rounded-full border transition-colors duration-200 " +
                  (selected
                    ? "bg-accent-soft border-accent text-ink"
                    : "bg-canvas border-border-strong text-ink-secondary hover:bg-subtle")
                }
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <label className="block">
        <span className="text-sm uppercase tracking-wide text-ink-muted">Notes (optional)</span>
        <textarea
          rows={2}
          value={values.notes}
          onChange={(e) => setKey("notes", e.target.value)}
          placeholder="e.g., Loud rooms trigger long headaches."
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink resize-none"
        />
      </label>
    </div>
  );
}
