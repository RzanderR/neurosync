const TIME_OPTIONS = [
  { value: "morning", label: "Morning" },
  { value: "afternoon", label: "Afternoon" },
  { value: "evening", label: "Evening" },
  { value: "no_preference", label: "No preference" },
];

function Toggle({ checked, onChange, label, description }) {
  return (
    <label className="flex items-start gap-4 p-4 rounded-xl border border-border-soft bg-canvas cursor-pointer hover:bg-subtle transition-colors duration-200">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-5 w-5 accent-accent"
      />
      <span className="flex-1">
        <span className="block text-base text-ink">{label}</span>
        {description && (
          <span className="block mt-1 text-sm text-ink-secondary">{description}</span>
        )}
      </span>
    </label>
  );
}

export default function AccessibilityStep({ values, onChange }) {
  function setKey(key, value) {
    onChange({ ...values, [key]: value });
  }

  return (
    <div className="space-y-5">
      <p className="m-0 text-base text-ink-secondary">
        These help us tailor how clinics communicate with you. You can change them later.
      </p>

      <div className="space-y-3">
        <Toggle
          checked={values.writtenCommunicationOnly}
          onChange={(v) => setKey("writtenCommunicationOnly", v)}
          label="Written communication only"
          description="Clinics will be asked to email, not call."
        />
        <Toggle
          checked={values.lowStimulationRequested}
          onChange={(v) => setKey("lowStimulationRequested", v)}
          label="Low-stimulation environment requested"
          description="We'll note this when scheduling — quiet waiting areas, dim lighting."
        />
        <Toggle
          checked={values.supportPersonAttending}
          onChange={(v) => setKey("supportPersonAttending", v)}
          label="A support person will attend appointments"
        />
        <Toggle
          checked={values.transportationConstraint}
          onChange={(v) => setKey("transportationConstraint", v)}
          label="I have transportation constraints"
          description="We'll prefer telehealth where possible."
        />
      </div>

      <fieldset>
        <legend className="text-sm uppercase tracking-wide text-ink-muted">
          Preferred time of day
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
          rows={3}
          value={values.notes}
          onChange={(e) => setKey("notes", e.target.value)}
          placeholder="e.g., 'Loud waiting rooms trigger headaches lasting 24+ hours.'"
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink resize-none"
        />
      </label>
    </div>
  );
}
