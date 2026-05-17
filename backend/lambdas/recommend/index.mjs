import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const REGION = process.env.AWS_REGION ?? "us-west-2";
const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ??
  "us.anthropic.claude-haiku-4-5-20251001-v1:0";

const bedrock = new BedrockRuntimeClient({ region: REGION });

const SYSTEM_PROMPT = `You route NeuroSync patients to one of two providers. Both providers are TBI-aware.

Provider A — id: "chen-neurology"
  Dr. Sarah Chen, Neurology. Swedish Neuroscience Institute, Seattle.
  Best fit when the patient mentions: post-concussion symptoms, headaches, migraines, memory or cognitive complaints, dizziness, neurological follow-up.

Provider B — id: "reed-pt"
  Dr. Marcus Reed, Physical Therapy. Reed PT Associates, Seattle.
  Best fit when the patient mentions: back / neck / shoulder pain, balance or vestibular issues, mobility, post-injury rehabilitation. Low-stimulation treatment rooms.

Pick the single best provider for the patient's request. Return ONLY a JSON object — no markdown, no code fences, no commentary — matching this exact shape:

{"providerId":"chen-neurology"|"reed-pt","reasoning":"<one short sentence written directly to the patient in plain, TBI-friendly language explaining the pick>"}`;

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
        max_tokens: 300,
        temperature: 0.2,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const response = await bedrock.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(response.body));
    const text = decoded?.content?.[0]?.text ?? "";

    const parsed = extractJson(text);
    const validIds = new Set(["chen-neurology", "reed-pt"]);
    if (!parsed || !validIds.has(parsed.providerId)) {
      console.error("Unexpected model output:", text);
      return errorResponse(
        502,
        "MODEL_OUTPUT_INVALID",
        "Model returned an unexpected response. Please try again."
      );
    }

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        providerId: parsed.providerId,
        reasoning: (parsed.reasoning ?? "").toString().slice(0, 400),
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
