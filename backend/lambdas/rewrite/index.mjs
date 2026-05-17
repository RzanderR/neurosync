import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

const REGION = process.env.AWS_REGION ?? "us-west-2";
const MODEL_ID =
  process.env.BEDROCK_MODEL_ID ??
  "us.anthropic.claude-haiku-4-5-20251001-v1:0";

const bedrock = new BedrockRuntimeClient({ region: REGION });

const SYSTEM_PROMPT = `You rewrite healthcare messages so they are easy to process for patients with Traumatic Brain Injury (TBI).

Rules:
- Short sentences. One idea per sentence.
- Plain language. No medical jargon — if you must use a term, explain it briefly.
- End with the concrete next step the patient should take, if there is one.
- Calm, factual tone. No urgency words like "URGENT" or "ASAP".
- Preserve all dates, times, names, addresses, and phone numbers exactly as written.

Return ONLY the rewritten message body. No preamble, no quotation marks, no explanation of what you changed.`;

const JSON_HEADERS = { "Content-Type": "application/json" };

function errorResponse(status, code, message) {
  return {
    statusCode: status,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: { code, message } }),
  };
}

export const handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event?.body || "{}");
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }

  const rawMessage = (body.rawMessage ?? "").toString();
  if (!rawMessage.trim()) {
    return errorResponse(
      400,
      "MISSING_MESSAGE",
      "Field 'rawMessage' is required."
    );
  }

  const patient = body.patient ?? {};
  const accessibilityNote = patient.accessibilityNotes
    ? `\n\nPatient accessibility notes: ${patient.accessibilityNotes}`
    : "";

  try {
    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 600,
        temperature: 0.3,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: `Rewrite this message for a TBI patient:${accessibilityNote}\n\n---\n${rawMessage}\n---`,
          },
        ],
      }),
    });

    const response = await bedrock.send(command);
    const decoded = JSON.parse(new TextDecoder().decode(response.body));
    const text = (decoded?.content?.[0]?.text ?? "").trim();

    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({ rewritten: text || rawMessage }),
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
