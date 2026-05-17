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
// All providers are TBI-aware.
const PROVIDERS = [
  {
    id: "chen-neurology",
    name: "Dr. Sarah Chen",
    specialty: "Neurology",
    bestFitFor:
      "post-concussion symptoms, headaches, migraines, memory or cognitive complaints, dizziness, neurological follow-up",
  },
  {
    id: "reed-pt",
    name: "Dr. Marcus Reed",
    specialty: "Physical Therapy",
    bestFitFor:
      "back / neck / shoulder / knee / hip pain, balance or vestibular issues, mobility, gait, post-injury physical rehabilitation",
  },
  {
    id: "okafor-speech",
    name: "Dr. Amara Okafor",
    specialty: "Speech-Language Pathology",
    bestFitFor:
      "trouble speaking, slurred speech, finding words (aphasia), stuttering, swallowing problems (dysphagia), voice issues, communication after a TBI",
  },
  {
    id: "tanaka-ot",
    name: "Dr. Yuki Tanaka",
    specialty: "Occupational Therapy",
    bestFitFor:
      "trouble with daily tasks (dressing, cooking, bathing, self-care), fine motor / hand coordination, writing, energy management and fatigue strategies",
  },
  {
    id: "ortiz-mentalhealth",
    name: "Dr. Mateo Ortiz",
    specialty: "Mental Health (Psychiatry & Therapy)",
    bestFitFor:
      "anxiety, depression, low mood, panic, PTSD or trauma, insomnia and sleep problems, irritability, feeling overwhelmed",
  },
  {
    id: "kim-primary",
    name: "Dr. Jordan Kim",
    specialty: "Primary Care",
    bestFitFor:
      "general checkups, annual physicals, medication refills, blood pressure, cold/flu/fever, fatigue, and anything that needs a primary care doctor first",
  },
];

const PROVIDER_IDS = new Set(PROVIDERS.map((p) => p.id));

function buildSystemPrompt() {
  const providerLines = PROVIDERS.map(
    (p, i) =>
      `${i + 1}. id: "${p.id}" — ${p.name}, ${p.specialty}.\n   Best fit when the patient mentions: ${p.bestFitFor}.`
  ).join("\n\n");

  return `You route NeuroSync patients to one of the providers below. All providers are TBI-aware.

${providerLines}

Pick the single best provider for the patient's request. If the request is clearly outside what these providers handle (for example: dental, dermatology, orthopedic injuries like broken bones, vision/eye care, cardiology, OB/GYN), return providerId: null with a brief reasoning explaining that NeuroSync doesn't cover that yet but more specialists are being added.

When you do pick a provider, also list up to 2 next-best alternates from the registry (ordered by relevance). Use only IDs from the list above. If there are no reasonable alternates, return an empty array.

Return ONLY a JSON object — no markdown, no code fences, no commentary — matching this exact shape:

{"providerId":"<id>"|null,"reasoning":"<one short sentence written directly to the patient in plain, TBI-friendly language>","alternates":["<id>", ...]}`;
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
        max_tokens: 400,
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
        reasoning: (parsed.reasoning ?? "").toString().slice(0, 400),
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
