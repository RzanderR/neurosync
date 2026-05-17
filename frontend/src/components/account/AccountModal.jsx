import { useEffect, useRef, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import { registerPatient } from "../../lib/api.js";
import IdentityStep from "./IdentityStep.jsx";
import AccessibilityStep from "./AccessibilityStep.jsx";
import InsuranceStep from "./InsuranceStep.jsx";

const TOTAL_STEPS = 3;

const EMPTY_IDENTITY = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  zip: "",
  country: "",
};

const EMPTY_ACCESSIBILITY = {
  writtenCommunicationOnly: true,
  lowStimulationRequested: true,
  supportPersonAttending: false,
  transportationConstraint: false,
  preferredTimeOfDay: "morning",
  notes: "",
};

const EMPTY_INSURANCE = { provider: "" };

const STEP_HEADERS = {
  1: {
    title: "Your information",
    subtitle: "Your name, contact, and where you live.",
  },
  2: {
    title: "How you'd like to be supported",
    subtitle: "These help clinics communicate with you. Change them any time.",
  },
  3: {
    title: "Insurance",
    subtitle: "Pick your provider. You can update this later.",
  },
};

function patientToFormValues(patient) {
  if (!patient) {
    return {
      identity: EMPTY_IDENTITY,
      accessibility: EMPTY_ACCESSIBILITY,
      insurance: EMPTY_INSURANCE,
    };
  }
  return {
    identity: {
      firstName: patient.firstName ?? "",
      lastName: patient.lastName ?? "",
      dateOfBirth: patient.dateOfBirth ?? "",
      email: patient.email ?? "",
      phone: patient.phone ?? "",
      street: patient.street ?? "",
      city: patient.city ?? "",
      state: patient.state ?? "",
      zip: patient.zip ?? "",
      country: patient.country ?? "",
    },
    accessibility: { ...EMPTY_ACCESSIBILITY, ...(patient.accessibilityProfile ?? {}) },
    insurance: { provider: patient.insurance ?? "" },
  };
}

function validateIdentity(identity) {
  const errors = {};
  if (!identity.firstName.trim()) errors.firstName = "Required.";
  if (!identity.lastName.trim()) errors.lastName = "Required.";
  if (!identity.email.trim()) {
    errors.email = "Required.";
  } else if (!/\S+@\S+\.\S+/.test(identity.email)) {
    errors.email = "That doesn't look like an email.";
  }
  if (identity.phone && !/\d/.test(identity.phone)) {
    errors.phone = "Phone should contain digits.";
  }
  return errors;
}

function clampStep(n) {
  if (n < 1) return 1;
  if (n > TOTAL_STEPS) return TOTAL_STEPS;
  return n;
}

export default function AccountModal() {
  const { patient, accountModalStartStep } = useAppState();
  const { setPatient, closeAccountModal } = useAppActions();

  const initial = patientToFormValues(patient);
  const [step, setStep] = useState(clampStep(accountModalStartStep));
  const [identity, setIdentity] = useState(initial.identity);
  const [accessibility, setAccessibility] = useState(initial.accessibility);
  const [insurance, setInsurance] = useState(initial.insurance);
  const [identityErrors, setIdentityErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setStep(clampStep(accountModalStartStep));
  }, [accountModalStartStep]);

  useEffect(() => {
    const el = containerRef.current?.querySelector("input, textarea, select, button");
    el?.focus();
  }, [step]);

  function handleNext() {
    if (step === 1) {
      const errs = validateIdentity(identity);
      setIdentityErrors(errs);
      if (Object.keys(errs).length === 0) setStep(2);
      return;
    }
    if (step === 2) {
      setStep(3);
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const incomingPatient = {
      id: patient?.id,
      ...identity,
      insurance: insurance.provider,
      preferredContactMethod: "email",
      accessibilityProfile: accessibility,
    };
    try {
      const result = await registerPatient(incomingPatient);
      setPatient(result.patient ?? { ...incomingPatient, id: result.patientId });
    } catch (err) {
      console.error("Register failed", err);
      setSubmitError(err.message ?? "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const isEditing = patient != null;
  const header = STEP_HEADERS[step];
  const isLastStep = step === TOTAL_STEPS;
  const primaryLabel = submitting
    ? "Saving…"
    : isLastStep
    ? isEditing ? "Save changes" : "Create account"
    : "Next";
  const primaryAction = isLastStep ? handleSubmit : handleNext;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
    >
      <div
        ref={containerRef}
        className="bg-surface max-w-2xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <header className="px-8 pt-8 pb-4 border-b border-border-soft">
          <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
            Step {step} of {TOTAL_STEPS}
          </p>
          <h2 id="account-modal-title" className="m-0 mt-1 text-2xl text-ink">
            {header.title}
          </h2>
          <p className="m-0 mt-2 text-base text-ink-secondary">
            {header.subtitle}
          </p>
        </header>

        <div className="px-8 py-6 overflow-y-auto">
          {step === 1 && (
            <IdentityStep
              values={identity}
              onChange={setIdentity}
              errors={identityErrors}
            />
          )}
          {step === 2 && (
            <AccessibilityStep values={accessibility} onChange={setAccessibility} />
          )}
          {step === 3 && (
            <InsuranceStep values={insurance} onChange={setInsurance} />
          )}

          {submitError && (
            <p className="mt-4 px-4 py-3 rounded-xl bg-error-bg text-error-text text-base">
              {submitError}
            </p>
          )}
        </div>

        <footer className="px-8 py-5 border-t border-border-soft flex items-center justify-between gap-4 bg-surface">
          {isEditing ? (
            <button
              type="button"
              onClick={closeAccountModal}
              className="px-5 py-3 rounded-full text-ink-secondary hover:bg-subtle transition-colors duration-200"
            >
              Cancel
            </button>
          ) : step === 1 ? (
            <span className="text-sm text-ink-muted">
              Your information is sent to your secure NeuroSync record.
            </span>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="px-5 py-3 rounded-full text-ink-secondary hover:bg-subtle transition-colors duration-200"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={primaryAction}
              disabled={submitting}
              className="px-7 py-3.5 rounded-full bg-accent text-accent-on hover:bg-accent-hover disabled:bg-subtle disabled:text-ink-muted transition-colors duration-200"
            >
              {primaryLabel}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
