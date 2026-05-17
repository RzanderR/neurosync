const INSURANCE_OPTIONS = [
  "Aetna",
  "Anthem",
  "Blue Cross Blue Shield",
  "Cigna",
  "Humana",
  "Kaiser Permanente",
  "Medicare",
  "Medicaid",
  "TRICARE",
  "UnitedHealthcare",
  "No insurance / Self-pay",
  "Other",
];

export default function InsuranceStep({ values, onChange }) {
  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm uppercase tracking-wide text-ink-muted">
          Insurance provider
        </span>
        <select
          value={values.provider}
          onChange={(e) => onChange({ ...values, provider: e.target.value })}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink"
        >
          <option value="">Select your insurance…</option>
          {INSURANCE_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </label>

      <p className="m-0 text-sm text-ink-secondary">
        We share this with clinics so they can verify coverage before your visit.
      </p>
    </div>
  );
}
