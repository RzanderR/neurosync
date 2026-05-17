const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

const COUNTRIES = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Australia",
  "India",
  "Other",
];

const INPUT_CLASSES =
  "mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink";
const LABEL_CLASSES = "text-sm uppercase tracking-wide text-ink-muted";

export default function IdentityStep({ values, onChange, errors }) {
  function field(key) {
    return (e) => onChange({ ...values, [key]: e.target.value });
  }

  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <label className="block">
        <span className={LABEL_CLASSES}>First name</span>
        <input
          type="text"
          autoComplete="given-name"
          value={values.firstName}
          onChange={field("firstName")}
          className={INPUT_CLASSES}
          required
        />
        {errors?.firstName && (
          <span className="block mt-1 text-sm text-error-text">{errors.firstName}</span>
        )}
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>Last name</span>
        <input
          type="text"
          autoComplete="family-name"
          value={values.lastName}
          onChange={field("lastName")}
          className={INPUT_CLASSES}
          required
        />
        {errors?.lastName && (
          <span className="block mt-1 text-sm text-error-text">{errors.lastName}</span>
        )}
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>Date of birth</span>
        <input
          type="date"
          autoComplete="bday"
          value={values.dateOfBirth}
          onChange={field("dateOfBirth")}
          className={INPUT_CLASSES}
        />
        {errors?.dateOfBirth && (
          <span className="block mt-1 text-sm text-error-text">{errors.dateOfBirth}</span>
        )}
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>Phone</span>
        <input
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={field("phone")}
          className={INPUT_CLASSES}
        />
        {errors?.phone && (
          <span className="block mt-1 text-sm text-error-text">{errors.phone}</span>
        )}
      </label>

      <label className="block sm:col-span-2">
        <span className={LABEL_CLASSES}>Email</span>
        <input
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={field("email")}
          className={INPUT_CLASSES}
          required
        />
        {errors?.email && (
          <span className="block mt-1 text-sm text-error-text">{errors.email}</span>
        )}
      </label>

      <label className="block sm:col-span-2">
        <span className={LABEL_CLASSES}>Street</span>
        <input
          type="text"
          autoComplete="address-line1"
          value={values.street}
          onChange={field("street")}
          className={INPUT_CLASSES}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>City</span>
        <input
          type="text"
          autoComplete="address-level2"
          value={values.city}
          onChange={field("city")}
          className={INPUT_CLASSES}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>State</span>
        <select
          autoComplete="address-level1"
          value={values.state}
          onChange={field("state")}
          className={INPUT_CLASSES}
        >
          <option value="">Select…</option>
          {US_STATES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>Zip</span>
        <input
          type="text"
          inputMode="numeric"
          autoComplete="postal-code"
          value={values.zip}
          onChange={field("zip")}
          className={INPUT_CLASSES}
        />
      </label>

      <label className="block">
        <span className={LABEL_CLASSES}>Country</span>
        <select
          autoComplete="country-name"
          value={values.country}
          onChange={field("country")}
          className={INPUT_CLASSES}
        >
          <option value="">Select…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </label>
    </div>
  );
}
