import { CLINICS } from "../data/mockClinics.js";

export const STEPS = {
  START: "START",
  IDLE: "IDLE",
  PICK_TYPE: "PICK_TYPE",
  PICK_CLINIC: "PICK_CLINIC",
  PICK_TIMEFRAME: "PICK_TIMEFRAME",
  CONFIRM: "CONFIRM",
  SUBMITTING: "SUBMITTING",
  DONE: "DONE",
};

const APPOINTMENT_TYPES = [
  { label: "Neurology follow-up", specialty: "Neurology" },
  { label: "Physical therapy initial evaluation", specialty: "Physical Therapy" },
  { label: "Primary care visit", specialty: "Primary Care" },
  { label: "Speech therapy session", specialty: "Speech Therapy" },
];

const TIMEFRAMES = [
  { label: "Next 2 weeks", value: "next 2 weeks" },
  { label: "Next month", value: "next month" },
  { label: "As soon as possible", value: "as soon as possible" },
];

function clinicsForSpecialty(specialty, providers) {
  const fromProviders = (providers ?? []).filter((p) => p.specialty === specialty);
  if (fromProviders.length > 0) return fromProviders;
  return CLINICS.filter((c) => c.specialty === specialty);
}

export function getPrompt(step, context, providers) {
  switch (step) {
    case STEPS.START:
      return {
        text: "Want to book a new appointment? Take your time.",
        chips: [
          { label: "Yes, let's book one", value: "begin" },
          { label: "Not right now", value: "not_now" },
        ],
        allowFreeText: false,
      };

    case STEPS.IDLE:
      return {
        text: "No problem. I'm here whenever you're ready.",
        chips: [{ label: "Book an appointment", value: "begin" }],
        allowFreeText: false,
      };

    case STEPS.PICK_TYPE:
      return {
        text: "What kind of appointment do you need?",
        chips: APPOINTMENT_TYPES.map((t) => ({ label: t.label, value: t.label })),
        allowFreeText: true,
        freeTextPlaceholder: "Or type the kind of appointment...",
      };

    case STEPS.PICK_CLINIC: {
      const specialty = APPOINTMENT_TYPES.find(
        (t) => t.label === context.appointmentType
      )?.specialty;
      const candidates = specialty
        ? clinicsForSpecialty(specialty, providers)
        : CLINICS;
      const chips =
        candidates.length > 0
          ? candidates.map((c) => ({
              label: `${c.name} — ${c.specialty}`,
              value: c.id,
            }))
          : CLINICS.map((c) => ({
              label: `${c.name} — ${c.specialty}`,
              value: c.id,
            }));
      return {
        text:
          candidates.length > 0
            ? "Here are providers who can help. Pick one when you're ready."
            : "I don't have a matching provider on file, but you can pick from these.",
        chips,
        allowFreeText: false,
      };
    }

    case STEPS.PICK_TIMEFRAME:
      return {
        text: "When would you like to be seen?",
        chips: TIMEFRAMES.map((t) => ({ label: t.label, value: t.value })),
        allowFreeText: true,
        freeTextPlaceholder: "Or type your preferred timeframe...",
      };

    case STEPS.CONFIRM: {
      const clinic = CLINICS.find((c) => c.id === context.clinicId);
      const clinicName = clinic?.name ?? "the provider";
      return {
        text:
          `Ready to book "${context.appointmentType}" with ${clinicName}, ` +
          `${context.preferredTimeframe ? `for ${context.preferredTimeframe}` : "in the coming weeks"}?`,
        chips: [
          { label: "Yes, book it", value: "submit" },
          { label: "Start over", value: "restart" },
        ],
        allowFreeText: false,
      };
    }

    case STEPS.SUBMITTING:
      return {
        text: "Working on it...",
        chips: [],
        allowFreeText: false,
      };

    case STEPS.DONE:
      return {
        text: "Anything else?",
        chips: [{ label: "Book another appointment", value: "begin" }],
        allowFreeText: false,
      };

    default:
      return { text: "", chips: [], allowFreeText: false };
  }
}

export function findClinicChoice(value) {
  return CLINICS.find((c) => c.id === value) ?? null;
}

export function findTypeBySpecialty(specialty) {
  return APPOINTMENT_TYPES.find((t) => t.specialty === specialty)?.label ?? null;
}
