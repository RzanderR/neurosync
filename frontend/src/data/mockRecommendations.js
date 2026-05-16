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
};

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

  const winner = scored[0].score > 0 ? scored[0].clinic : CLINICS[0];
  return {
    providerId: winner.id,
    reasoning: pickTemplate(winner.id, requestText),
  };
}
