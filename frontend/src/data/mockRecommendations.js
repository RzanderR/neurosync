import { CLINICS } from "./mockClinics.js";

const MATCH_TEMPLATES = {
  "chen-neurology": [
    "Dr. Chen handles post-TBI follow-up, headaches, and cognitive symptoms — and she accepts {insurance}.",
    "Neurology is the right starting point, Dr. Chen specializes in TBI care, and your {insurance} plan is in-network.",
  ],
  "nguyen-neurology": [
    "Dr. Nguyen runs the Northgate neurology clinic, takes {insurance}, and handles post-concussion and headache care.",
    "Dr. Nguyen is a good fit for what you're describing and accepts {insurance}.",
  ],
  "reed-pt": [
    "Dr. Reed does TBI-aware physical therapy in Wallingford and is in-network for {insurance}.",
    "What you're describing sounds physical — Dr. Reed accepts {insurance} and runs a low-stimulation PT clinic.",
  ],
  "patel-pt": [
    "Dr. Patel runs Alki Movement Therapy in West Seattle, takes {insurance}, and handles balance and pain-driven PT.",
    "Dr. Patel is a good fit for this and accepts {insurance}.",
  ],
  "okafor-speech": [
    "Dr. Okafor is a speech-language pathologist in South Lake Union and accepts {insurance}.",
    "Speech therapy is the right fit, and Dr. Okafor is in-network for {insurance}.",
  ],
  "lin-speech": [
    "Dr. Lin runs a TBI-aware speech and voice clinic in Ballard and accepts {insurance}.",
    "Dr. Lin is a good fit for the speech and language concerns you mentioned and takes {insurance}.",
  ],
  "tanaka-ot": [
    "Dr. Tanaka does occupational therapy in Capitol Hill — daily-life support — and accepts {insurance}.",
    "Sounds like OT is the right call. Dr. Tanaka takes {insurance}.",
  ],
  "brooks-ot": [
    "Dr. Brooks runs an OT studio on Beacon Hill, helps with daily routines after a TBI, and accepts {insurance}.",
    "Dr. Brooks is a good fit and is in-network for {insurance}.",
  ],
  "ortiz-mentalhealth": [
    "Dr. Ortiz handles mental health care for TBI survivors at First Hill and accepts {insurance}.",
    "Dr. Ortiz is the right person for this — psychiatry and therapy, in-network for {insurance}.",
  ],
  "wong-mentalhealth": [
    "Dr. Wong runs a TBI-aware mental health clinic in Fremont and accepts {insurance}.",
    "Dr. Wong fits what you described and is in-network for {insurance}.",
  ],
  "kim-primary": [
    "Dr. Kim is a primary care doctor in Capitol Hill, TBI-aware, and accepts {insurance}.",
    "Sounds like a primary care visit. Dr. Kim is in-network for {insurance}.",
  ],
  "sato-primary": [
    "Dr. Sato runs Greenwood Family Health, takes {insurance}, and handles general primary care.",
    "Dr. Sato is a good primary-care fit and is in-network for {insurance}.",
  ],
};

const NEUTRAL_TEMPLATES = {
  "chen-neurology": [
    "Dr. Chen handles post-TBI follow-up, headaches, and cognitive symptoms — a good fit for what you described.",
  ],
  "nguyen-neurology": [
    "Dr. Nguyen runs the Northgate neurology clinic and handles post-concussion and headache care.",
  ],
  "reed-pt": [
    "Dr. Reed does TBI-aware physical therapy in Wallingford and works well with balance and pain concerns.",
  ],
  "patel-pt": [
    "Dr. Patel runs Alki Movement Therapy in West Seattle and handles balance, mobility, and pain-driven PT.",
  ],
  "okafor-speech": [
    "Dr. Okafor is a speech-language pathologist in South Lake Union who works with TBI survivors.",
  ],
  "lin-speech": [
    "Dr. Lin runs a TBI-aware speech and voice clinic in Ballard.",
  ],
  "tanaka-ot": [
    "Dr. Tanaka does occupational therapy in Capitol Hill, focused on daily-life support after a TBI.",
  ],
  "brooks-ot": [
    "Dr. Brooks runs an OT studio on Beacon Hill, focused on daily routines after a TBI.",
  ],
  "ortiz-mentalhealth": [
    "Dr. Ortiz handles mental health care for TBI survivors at First Hill.",
  ],
  "wong-mentalhealth": [
    "Dr. Wong runs a TBI-aware mental health clinic in Fremont.",
  ],
  "kim-primary": [
    "Dr. Kim is a TBI-aware primary care doctor in Capitol Hill.",
  ],
  "sato-primary": [
    "Dr. Sato runs Greenwood Family Health and handles general primary care.",
  ],
};

function mismatchReason(clinic, insurance) {
  return (
    `${clinic.name} is the closest fit in ${clinic.neighborhood}, but doesn't take ${insurance}. ` +
    `You may want to verify coverage with their office before booking.`
  );
}

const NO_MATCH_REASONING =
  "We don't have a provider for that yet — we're working on adding more soon. " +
  "For now, you could try describing it a different way or contact your primary care provider.";

const SKIP_INSURANCE_VALUES = new Set([
  "",
  "Other",
  "No insurance / Self-pay",
]);

function pickTemplate(templates, providerId, requestText, insurance) {
  const list = templates[providerId] ?? [];
  if (list.length === 0) return "";
  const idx = Math.abs(hash(requestText + providerId)) % list.length;
  return list[idx].replace("{insurance}", insurance);
}

function hash(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return h;
}

export function pickProvider(requestText, patient) {
  const text = (requestText || "").toLowerCase();
  const insurance = patient?.insurance ?? "";
  const considerInsurance =
    insurance.length > 0 && !SKIP_INSURANCE_VALUES.has(insurance);
  const patientZip = (patient?.zip ?? "").trim();

  const scored = CLINICS.map((clinic) => {
    const specialty = clinic.keywords.reduce(
      (acc, kw) => (text.includes(kw) ? acc + 1 : acc),
      0
    );
    const insuranceMatch =
      considerInsurance && clinic.acceptedInsurance.includes(insurance);
    let location = 0;
    if (patientZip) {
      if (patientZip === clinic.zip) location += 5;
      else if (patientZip.slice(0, 3) === clinic.zip.slice(0, 3)) location += 1;
    }
    const total =
      specialty === 0
        ? 0
        : specialty + (insuranceMatch ? 100 : 0) + location;
    return { clinic, specialty, insuranceMatch, location, total };
  });

  const specialtyFits = scored.filter((s) => s.specialty > 0);
  if (specialtyFits.length === 0) {
    return { providerId: null, reasoning: NO_MATCH_REASONING, alternates: [] };
  }

  specialtyFits.sort((a, b) => b.total - a.total);
  const winner = specialtyFits[0];
  const alternates = specialtyFits.slice(1, 3).map((s) => s.clinic.id);

  let reasoning;
  if (considerInsurance && !winner.insuranceMatch) {
    reasoning = mismatchReason(winner.clinic, insurance);
  } else if (considerInsurance && winner.insuranceMatch) {
    reasoning = pickTemplate(
      MATCH_TEMPLATES,
      winner.clinic.id,
      requestText,
      insurance
    );
  } else {
    reasoning = pickTemplate(
      NEUTRAL_TEMPLATES,
      winner.clinic.id,
      requestText,
      insurance
    );
  }

  return {
    providerId: winner.clinic.id,
    reasoning,
    alternates,
  };
}
