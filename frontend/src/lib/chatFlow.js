import { findClinicById } from "../data/mockClinics.js";

export const STEPS = {
  START: "START",
  DESCRIBING: "DESCRIBING",
  CONFIRM_PROVIDER: "CONFIRM_PROVIDER",
  NO_MATCH: "NO_MATCH",
  PICK_TIMEFRAME: "PICK_TIMEFRAME",
  CONFIRM: "CONFIRM",
  SUBMITTING: "SUBMITTING",
  DONE: "DONE",
};

const TIMEFRAMES = [
  { label: "Next 2 weeks", value: "next 2 weeks" },
  { label: "Next month", value: "next month" },
  { label: "As soon as possible", value: "as soon as possible" },
];

const EXAMPLE_PROMPTS = [
  "I've been having post-concussion headaches.",
  "I'm having trouble finding the right words when I talk.",
  "I keep losing my balance lately.",
];

export function getPrompt(step, context) {
  switch (step) {
    case STEPS.START:
      return {
        text:
          "Tell me what's going on in a sentence or two. I'll suggest a provider who fits.",
        chips: EXAMPLE_PROMPTS.map((p) => ({ label: p, value: p })),
        allowFreeText: true,
        freeTextPlaceholder: "e.g., I get headaches that won't go away…",
      };

    case STEPS.DESCRIBING:
      return { text: "", chips: [], allowFreeText: false };

    case STEPS.CONFIRM_PROVIDER: {
      const provider = findClinicById(context.clinicId);
      const hasAlternates = (context.alternates ?? []).length > 0;
      const chips = [{ label: "Yes, let's book", value: "confirm" }];
      if (hasAlternates) chips.push({ label: "See other options", value: "see-other" });
      chips.push({ label: "Start over", value: "restart" });
      return {
        text: provider ? "Sound good?" : "I couldn't find a fit. Want to try again?",
        chips,
        allowFreeText: false,
      };
    }

    case STEPS.NO_MATCH:
      return {
        text:
          "I don't have a provider for that yet. We're adding more specialists soon. Want to try describing it differently?",
        chips: [{ label: "Start over", value: "restart" }],
        allowFreeText: false,
      };

    case STEPS.PICK_TIMEFRAME:
      return {
        text: "When would you like to be seen?",
        chips: TIMEFRAMES,
        allowFreeText: true,
        freeTextPlaceholder: "Or type your preferred timeframe…",
      };

    case STEPS.CONFIRM: {
      const provider = findClinicById(context.clinicId);
      const providerName = provider?.name ?? "the provider";
      const apptType =
        context.appointmentType ?? provider?.defaultAppointmentType ?? "an appointment";
      const tf = context.preferredTimeframe
        ? ` for ${context.preferredTimeframe}`
        : "";
      return {
        text: `Ready to book a ${apptType.toLowerCase()} with ${providerName}${tf}?`,
        chips: [
          { label: "Yes, book it", value: "submit" },
          { label: "Start over", value: "restart" },
        ],
        allowFreeText: false,
      };
    }

    case STEPS.SUBMITTING:
      return { text: "", chips: [], allowFreeText: false };

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
