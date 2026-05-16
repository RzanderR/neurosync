import { mockScheduleResponse } from "../data/mockScheduleResponses.js";
import { MOCK_REWRITE } from "../data/mockMessages.js";
import { MOCK_PROVIDERS } from "../data/mockProviders.js";

const SCHEDULE_URL = import.meta.env.VITE_SCHEDULE_URL;
const REWRITE_URL = import.meta.env.VITE_REWRITE_URL;
const PROVIDERS_S3_URL = import.meta.env.VITE_PROVIDERS_S3_URL;
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const SHOULD_MOCK_SCHEDULE = USE_MOCKS || !SCHEDULE_URL;
const SHOULD_MOCK_REWRITE = USE_MOCKS || !REWRITE_URL;
const SHOULD_MOCK_PROVIDERS = USE_MOCKS || !PROVIDERS_S3_URL;

async function postJson(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    let detail;
    try {
      detail = await res.json();
    } catch {
      detail = { error: { message: res.statusText } };
    }
    const err = new Error(detail.error?.message ?? "Request failed");
    err.code = detail.error?.code;
    err.status = res.status;
    throw err;
  }
  return res.json();
}

function simulateLatency(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function scheduleAppointment(request) {
  if (SHOULD_MOCK_SCHEDULE) {
    await simulateLatency(900);
    return mockScheduleResponse(request);
  }
  return postJson(SCHEDULE_URL, request);
}

export async function rewriteMessage({ rawMessage, patient }) {
  if (SHOULD_MOCK_REWRITE) {
    await simulateLatency(1200);
    return { rewritten: MOCK_REWRITE };
  }
  return postJson(REWRITE_URL, { rawMessage, patient });
}

export async function fetchProviders() {
  if (SHOULD_MOCK_PROVIDERS) {
    await simulateLatency(300);
    return MOCK_PROVIDERS;
  }
  const res = await fetch(PROVIDERS_S3_URL, { method: "GET" });
  if (!res.ok) throw new Error(`Failed to load providers (${res.status})`);
  const data = await res.json();
  return Array.isArray(data) ? data : data.providers ?? [];
}

export const mockMode = {
  schedule: SHOULD_MOCK_SCHEDULE,
  rewrite: SHOULD_MOCK_REWRITE,
  providers: SHOULD_MOCK_PROVIDERS,
};
