import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const REGION = process.env.AWS_REGION ?? "us-west-2";
const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ??
  "us.anthropic.claude-haiku-4-5-20251001-v1:0";

const bedrock = new BedrockRuntimeClient({ region: REGION });

// Keep in sync with backend/lambdas/schedule/index.mjs and frontend/src/data/mockClinics.js.
// All providers are TBI-aware. acceptedInsurance values must match the
// InsuranceStep dropdown options on the frontend.
const PROVIDERS = [
  {
    id: "chen-neurology",
    name: "Dr. Sarah Chen",
    specialty: "Neurology",
    neighborhood: "First Hill",
    zip: "98122",
    acceptedInsurance: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"],
    bestFitFor:
      "post-concussion symptoms, headaches, migraines, memory or cognitive complaints, dizziness, neurological follow-up",
  },
  {
    id: "nguyen-neurology",
    name: "Dr. Lan Nguyen",
    specialty: "Neurology",
    neighborhood: "Northgate",
    zip: "98125",
    acceptedInsurance: ["Anthem", "Humana", "Kaiser Permanente", "Medicare"],
    bestFitFor:
      "post-concussion symptoms, headaches, migraines, memory or cognitive complaints, dizziness, neurological follow-up",
  },
  {
    id: "reed-pt",
    name: "Dr. Marcus Reed",
    specialty: "Physical Therapy",
    neighborhood: "Wallingford",
    zip: "98103",
    acceptedInsurance: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"],
    bestFitFor:
      "back / neck / shoulder / knee / hip pain, balance or vestibular issues, mobility, gait, post-injury physical rehabilitation",
  },
  {
    id: "patel-pt",
    name: "Dr. Priya Patel",
    specialty: "Physical Therapy",
    neighborhood: "West Seattle",
    zip: "98116",
    acceptedInsurance: ["Humana", "Medicare", "Medicaid", "TRICARE"],
    bestFitFor:
      "back / neck / shoulder / knee / hip pain, balance or vestibular issues, mobility, gait, post-injury physical rehabilitation",
  },
  {
    id: "okafor-speech",
    name: "Dr. Amara Okafor",
    specialty: "Speech-Language Pathology",
    neighborhood: "South Lake Union",
    zip: "98109",
    acceptedInsurance: ["Aetna", "Blue Cross Blue Shield", "Cigna", "Medicare"],
    bestFitFor:
      "trouble speaking, slurred speech, finding words (aphasia), stuttering, swallowing problems (dysphagia), voice issues, communication after a TBI",
  },
  {
    id: "lin-speech",
    name: "Dr. Wei Lin",
    specialty: "Speech-Language Pathology",
    neighborhood: "Ballard",
    zip: "98117",
    acceptedInsurance: ["Anthem", "Humana", "Kaiser Permanente", "UnitedHealthcare"],
    bestFitFor:
      "trouble speaking, slurred speech, finding words (aphasia), stuttering, swallowing problems (dysphagia), voice issues, communication after a TBI",
  },
  {
    id: "tanaka-ot",
    name: "Dr. Yuki Tanaka",
    specialty: "Occupational Therapy",
    neighborhood: "Capitol Hill",
    zip: "98122",
    acceptedInsurance: ["Aetna", "Blue Cross Blue Shield", "Cigna", "UnitedHealthcare"],
    bestFitFor:
      "trouble with daily tasks (dressing, cooking, bathing, self-care), fine motor / hand coordination, writing, energy management and fatigue strategies",
  },
  {
    id: "brooks-ot",
    name: "Dr. Elena Brooks",
    specialty: "Occupational Therapy",
    neighborhood: "Beacon Hill",
    zip: "98144",
    acceptedInsurance: ["Anthem", "Medicare", "Medicaid", "TRICARE"],
    bestFitFor:
      "trouble with daily tasks (dressing, cooking, bathing, self-care), fine motor / hand coordination, writing, energy management and fatigue strategies",
  },
  {
    id: "ortiz-mentalhealth",
    name: "Dr. Mateo Ortiz",
    specialty: "Mental Health (Psychiatry & Therapy)",
    neighborhood: "First Hill",
    zip: "98104",
    acceptedInsurance: ["Aetna", "Anthem", "Blue Cross Blue Shield", "Cigna"],
    bestFitFor:
      "anxiety, depression, low mood, panic, PTSD or trauma, insomnia and sleep problems, irritability, feeling overwhelmed",
  },
  {
    id: "wong-mentalhealth",
    name: "Dr. Hannah Wong",
    specialty: "Mental Health (Psychiatry & Therapy)",
    neighborhood: "Fremont",
    zip: "98103",
    acceptedInsurance: ["Humana", "Kaiser Permanente", "TRICARE", "UnitedHealthcare"],
    bestFitFor:
      "anxiety, depression, low mood, panic, PTSD or trauma, insomnia and sleep problems, irritability, feeling overwhelmed",
  },
  {
    id: "kim-primary",
    name: "Dr. Jordan Kim",
    specialty: "Primary Care",
    neighborhood: "Capitol Hill",
    zip: "98122",
    acceptedInsurance: ["Aetna", "Blue Cross Blue Shield", "Cigna", "Humana", "UnitedHealthcare"],
    bestFitFor:
      "general checkups, annual physicals, medication refills, blood pressure, cold/flu/fever, fatigue, and anything that needs a primary care doctor first",
  },
  {
    id: "sato-primary",
    name: "Dr. Riku Sato",
    specialty: "Primary Care",
    neighborhood: "Greenwood",
    zip: "98103",
    acceptedInsurance: ["Anthem", "Kaiser Permanente", "Medicare", "Medicaid", "TRICARE"],
    bestFitFor:
      "general checkups, annual physicals, medication refills, blood pressure, cold/flu/fever, fatigue, and anything that needs a primary care doctor first",
  },
];

const PROVIDER_IDS = new Set(PROVIDERS.map((p) => p.id));

function buildSystemPrompt() {
  const providerLines = PROVIDERS.map(
    (p, i) =>
      `${i + 1}. id: "${p.id}" — ${p.name}, ${p.specialty}. ${p.neighborhood} (${p.zip}). Accepts: ${p.acceptedInsurance.join(", ")}.\n   Best fit when the patient mentions: ${p.bestFitFor}.`
  ).join("\n\n");

  return `You route NeuroSync patients to one of the providers below. All providers are TBI-aware.

${providerLines}

Matching rules (apply in order):

1. Narrow to providers whose specialty fits the patient's request.
2. Among those, prefer providers whose "Accepts" list includes the patient's insurance plan (the patient's plan, if known, is included in the user message).
3. If no specialty-matching provider accepts the patient's insurance, pick the same-specialty provider whose neighborhood/zip is geographically closest to the patient (the patient's zip and city are in the user message when available). In the "reasoning" string, plainly say the insurance plan isn't accepted and the patient should verify coverage with the clinic.
4. If the patient's insurance is "No insurance / Self-pay", "Other", or missing, skip rule 2 and pick on specialty + location only. The reasoning string should be neutral on insurance.
5. If no provider in the registry has a specialty that fits the request at all (for example: dental, dermatology, orthopedic injuries like broken bones, vision/eye care, OB/GYN), return providerId: null with reasoning like "We don't have a provider for that yet — we're working on adding more soon."

Also list up to 2 next-best alternates from the registry, ordered by relevance. Use only IDs from the list above. If there are no reasonable alternates, return an empty array. The alternates list must be empty when providerId is null.

Return ONLY a JSON object — no markdown, no code fences, no commentary — matching this exact shape:

{"providerId":"<id>"|null,"reasoning":"<one or two short, TBI-friendly sentences written directly to the patient>","alternates":["<id>", ...]}`;
}

const SYSTEM_PROMPT = buildSystemPrompt();

const JSON_HEADERS = { "Content-Type": "application/json" };

function errorResponse(status, code, message) {
  return {
    statusCode: status,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: { code, message } }),
  };
}

function extractJson(text) {
  const trimmed = (text ?? "").trim();
  try {
    return JSON.parse(trimmed);
  } catch {}
  const match = trimmed.match(/\{[\s\S]*\}/);
  if (match) {
    try {
      return JSON.parse(match[0]);
    } catch {}
  }
  return null;
}

export const handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event?.body || "{}");
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }

  const request = (body.request ?? "").toString().slice(0, 1000);
  const patient = body.patient ?? {};

  if (!request.trim()) {
    return errorResponse(
      400,
      "MISSING_REQUEST",
      "Field 'request' is required."
    );
  }

  const userMessage = [
    `Patient request: ${request}`,
    patient.firstName ? `Patient first name: ${patient.firstName}` : null,
    patient.insurance ? `Patient insurance plan: ${patient.insurance}` : null,
    patient.zip ? `Patient zip: ${patient.zip}` : null,
    patient.city ? `Patient city: ${patient.city}` : null,
    patient.state ? `Patient state: ${patient.state}` : null,
    patient.accessibilityNotes
      ? `Accessibility notes: ${patient.accessibilityNotes}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 500,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const response = await bedrock.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(response.body));
    const text = decoded?.content?.[0]?.text ?? "";

    const parsed = extractJson(text);
    if (!parsed) {
      console.error("Unexpected model output:", text);
      return errorResponse(
        502,
        "MODEL_OUTPUT_INVALID",
        "Model returned an unexpected response. Please try again."
      );
    }

    const rawId = parsed.providerId;
    const providerId =
      rawId === null || rawId === undefined ? null : String(rawId);
    if (providerId !== null && !PROVIDER_IDS.has(providerId)) {
      console.error("Unknown providerId from model:", text);
      return errorResponse(
        502,
        "MODEL_OUTPUT_INVALID",
        "Model returned an unknown provider. Please try again."
      );
    }

    const rawAlternates = Array.isArray(parsed.alternates) ? parsed.alternates : [];
    const alternates = rawAlternates
      .map((v) => (v == null ? "" : String(v)))
      .filter((id) => PROVIDER_IDS.has(id) && id !== providerId)
      .slice(0, 2);

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        providerId,
        reasoning: (parsed.reasoning ?? "").toString().slice(0, 500),
        alternates: providerId === null ? [] : alternates,
      }),
    };
  } catch (err) {
    console.error("Bedrock invoke failed", err);
    return errorResponse(
      502,
      "BEDROCK_ERROR",
      err?.message || "Bedrock invocation failed."
    );
  }
};
