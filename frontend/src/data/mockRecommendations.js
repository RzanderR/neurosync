import { CLINICS } from "./mockClinics.js";

const REASONING_TEMPLATES = {
  "chen-neurology": [
    "Dr. Chen's neurology practice handles post-TBI follow-up, headaches, and cognitive symptoms — that lines up with what you described.",
    "Neurology is the right starting point for the symptoms you mentioned, and Dr. Chen specializes in TBI care.",
    "What you're describing sounds neurological, so Dr. Chen is the better fit.",
  ],
  "reed-pt": [
    "What you're describing sounds physical — Dr. Reed's clinic does TBI-aware physical therapy with low-stimulation treatment rooms.",
    "Dr. Reed handles balance, mobility, and pain-driven appointments and accommodates TBI patients carefully.",
    "Sounds like physical therapy is the right place to start, and Dr. Reed's clinic is set up for TBI patients.",
  ],
  "okafor-speech": [
    "Dr. Okafor is a speech-language pathologist — she works with patients on speech, language, and swallowing after a TBI.",
    "What you're describing sounds like a speech or language concern, and Dr. Okafor specializes in that for TBI survivors.",
    "Speech therapy is the right fit here. Dr. Okafor's clinic is calm and TBI-aware.",
  ],
  "tanaka-ot": [
    "Dr. Tanaka does occupational therapy — she helps with daily tasks like dressing, cooking, and self-care after a TBI.",
    "That sounds like an occupational therapy concern. Dr. Tanaka focuses on getting daily life working again.",
    "Dr. Tanaka helps TBI patients rebuild fine motor skills and daily routines — that matches what you described.",
  ],
  "ortiz-mentalhealth": [
    "Dr. Ortiz handles mental health care for TBI survivors — anxiety, mood, and sleep are all in scope.",
    "What you're describing sounds emotional or mental-health related. Dr. Ortiz works with TBI patients on these things gently.",
    "Dr. Ortiz is the right person for this — he does psychiatry and therapy with TBI-aware pacing.",
  ],
  "kim-primary": [
    "Dr. Kim is a primary care doctor and a good starting point for general health concerns — she's TBI-aware too.",
    "This sounds like a primary care visit. Dr. Kim handles checkups, refills, and general questions.",
    "Dr. Kim's family medicine practice can help with this — and refer onward if needed.",
  ],
};

const NO_MATCH_REASONING =
  "NeuroSync doesn't have a provider for that yet — we're adding new specialists. For now I can't book that for you. You could try describing it a different way, or contact your primary care provider.";

function pickTemplate(providerId, requestText) {
  const templates = REASONING_TEMPLATES[providerId] ?? [];
  if (templates.length === 0) return "";
  const idx = Math.abs(hash(requestText)) % templates.length;
  return templates[idx];
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function pickProvider(requestText) {
  const text = (requestText || "").toLowerCase();
  const scored = CLINICS.map((clinic) => {
    const score = clinic.keywords.reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0
    );
    return { clinic, score };
  });
  scored.sort((a, b) => b.score - a.score);

  if (scored[0].score === 0) {
    return {
      providerId: null,
      reasoning: NO_MATCH_REASONING,
      alternates: [],
    };
  }

  const matched = scored.filter((s) => s.score > 0);
  const winner = matched[0].clinic;
  const alternates = matched.slice(1, 3).map((s) => s.clinic.id);

  return {
    providerId: winner.id,
    reasoning: pickTemplate(winner.id, requestText),
    alternates,
  };
}
