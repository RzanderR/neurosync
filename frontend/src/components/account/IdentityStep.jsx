export default function IdentityStep({ values, onChange, errors }) {
  function field(key, value) {
    return (e) => onChange({ ...values, [key]: e.target.value });
  }

  return (
    <div className="space-y-5">
      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-sm uppercase tracking-wide text-ink-muted">First name</span>
          <input
            type="text"
            autoComplete="given-name"
            value={values.firstName}
            onChange={field("firstName")}
            className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink"
            required
          />
          {errors?.firstName && (
            <span className="block mt-1 text-sm text-error-text">{errors.firstName}</span>
          )}
        </label>

        <label className="block">
          <span className="text-sm uppercase tracking-wide text-ink-muted">Last name</span>
          <input
            type="text"
            autoComplete="family-name"
            value={values.lastName}
            onChange={field("lastName")}
            className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink"
            required
          />
          {errors?.lastName && (
            <span className="block mt-1 text-sm text-error-text">{errors.lastName}</span>
          )}
        </label>
      </div>

      <label className="block">
        <span className="text-sm uppercase tracking-wide text-ink-muted">Date of birth</span>
        <input
          type="date"
          autoComplete="bday"
          value={values.dateOfBirth}
          onChange={field("dateOfBirth")}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink"
        />
        {errors?.dateOfBirth && (
          <span className="block mt-1 text-sm text-error-text">{errors.dateOfBirth}</span>
        )}
      </label>

      <label className="block">
        <span className="text-sm uppercase tracking-wide text-ink-muted">Email</span>
        <input
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={field("email")}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink"
          required
        />
        {errors?.email && (
          <span className="block mt-1 text-sm text-error-text">{errors.email}</span>
        )}
      </label>

      <label className="block">
        <span className="text-sm uppercase tracking-wide text-ink-muted">Phone</span>
        <input
          type="tel"
          autoComplete="tel"
          value={values.phone}
          onChange={field("phone")}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink"
        />
        {errors?.phone && (
          <span className="block mt-1 text-sm text-error-text">{errors.phone}</span>
        )}
      </label>

      <label className="block">
        <span className="text-sm uppercase tracking-wide text-ink-muted">Address</span>
        <textarea
          autoComplete="street-address"
          rows={2}
          value={values.address}
          onChange={field("address")}
          className="mt-1 w-full px-4 py-3 rounded-xl bg-canvas border border-border-strong text-ink resize-none"
        />
      </label>
    </div>
  );
}
