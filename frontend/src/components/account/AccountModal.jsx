import { useEffect, useRef, useState } from "react";
import { useAppState, useAppActions } from "../../state/store.jsx";
import { registerPatient } from "../../lib/api.js";
import IdentityStep from "./IdentityStep.jsx";
import AccessibilityStep from "./AccessibilityStep.jsx";

const EMPTY_IDENTITY = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  email: "",
  phone: "",
  address: "",
};

const EMPTY_ACCESSIBILITY = {
  writtenCommunicationOnly: true,
  lowStimulationRequested: true,
  supportPersonAttending: false,
  transportationConstraint: false,
  preferredTimeOfDay: "morning",
  notes: "",
};

function patientToFormValues(patient) {
  if (!patient) return { identity: EMPTY_IDENTITY, accessibility: EMPTY_ACCESSIBILITY };
  return {
    identity: {
      firstName: patient.firstName ?? "",
      lastName: patient.lastName ?? "",
      dateOfBirth: patient.dateOfBirth ?? "",
      email: patient.email ?? "",
      phone: patient.phone ?? "",
      address: patient.address ?? "",
    },
    accessibility: { ...EMPTY_ACCESSIBILITY, ...(patient.accessibilityProfile ?? {}) },
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

export default function AccountModal() {
  const { patient, accountModalStartStep } = useAppState();
  const { setPatient, closeAccountModal } = useAppActions();

  const initial = patientToFormValues(patient);
  const [step, setStep] = useState(accountModalStartStep);
  const [identity, setIdentity] = useState(initial.identity);
  const [accessibility, setAccessibility] = useState(initial.accessibility);
  const [identityErrors, setIdentityErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const containerRef = useRef(null);

  useEffect(() => {
    setStep(accountModalStartStep);
  }, [accountModalStartStep]);

  useEffect(() => {
    const el = containerRef.current?.querySelector("input, textarea, button");
    el?.focus();
  }, [step]);

  function handleNext() {
    const errs = validateIdentity(identity);
    setIdentityErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setSubmitError(null);
    const incomingPatient = {
      id: patient?.id,
      ...identity,
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

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40"
    >
      <div
        ref={containerRef}
        className="bg-surface max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <header className="px-8 pt-8 pb-4 border-b border-border-soft">
          <p className="m-0 text-sm uppercase tracking-wide text-ink-muted">
            Step {step} of 2
          </p>
          <h2 id="account-modal-title" className="m-0 mt-1 text-2xl text-ink">
            {step === 1 ? "Your information" : "How you'd like to be supported"}
          </h2>
          <p className="m-0 mt-2 text-base text-ink-secondary">
            {step === 1
              ? "We use this to set up appointments and identify you to clinics."
              : "Tell us a little about what works best for you. You can change these any time."}
          </p>
        </header>

        <div className="px-8 py-6 overflow-y-auto">
          {step === 1 ? (
            <IdentityStep
              values={identity}
              onChange={setIdentity}
              errors={identityErrors}
            />
          ) : (
            <AccessibilityStep values={accessibility} onChange={setAccessibility} />
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
          ) : (
            <span className="text-sm text-ink-muted">
              Your information is sent to your secure NeuroSync record.
            </span>
          )}

          <div className="flex items-center gap-3">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-3 rounded-full text-ink-secondary hover:bg-subtle transition-colors duration-200"
              >
                Back
              </button>
            )}
            {step === 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover transition-colors duration-200"
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 rounded-full bg-accent text-accent-on hover:bg-accent-hover disabled:bg-subtle disabled:text-ink-muted transition-colors duration-200"
              >
                {submitting ? "Saving…" : isEditing ? "Save changes" : "Finish setup"}
              </button>
            )}
          </div>
        </footer>
      </div>
    </div>
  );
}
