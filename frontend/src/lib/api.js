import { mockScheduleResponse } from "../data/mockScheduleResponses.js";
import { pickProvider } from "../data/mockRecommendations.js";

const SCHEDULE_URL = import.meta.env.VITE_SCHEDULE_URL;
const REWRITE_URL = import.meta.env.VITE_REWRITE_URL;
const REGISTER_URL = import.meta.env.VITE_REGISTER_URL;
const RECOMMEND_URL = import.meta.env.VITE_RECOMMEND_URL;
const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === "true";

const SHOULD_MOCK_SCHEDULE = USE_MOCKS || !SCHEDULE_URL;
const SHOULD_MOCK_REWRITE = USE_MOCKS || !REWRITE_URL;
const SHOULD_MOCK_REGISTER = USE_MOCKS || !REGISTER_URL;
const SHOULD_MOCK_RECOMMEND = USE_MOCKS || !RECOMMEND_URL;

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

function generatePatientId() {
  return `patient-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

export async function registerPatient(patient) {
  if (SHOULD_MOCK_REGISTER) {
    await simulateLatency(500);
    const id = patient.id ?? generatePatientId();
    return { patientId: id, patient: { ...patient, id } };
  }
  return postJson(REGISTER_URL, patient);
}

export async function recommendProvider({ patient, request }) {
  if (SHOULD_MOCK_RECOMMEND) {
    await simulateLatency(900);
    return pickProvider(request, patient);
  }
  return postJson(RECOMMEND_URL, { patient, request });
}

export async function scheduleAppointment(request) {
  if (SHOULD_MOCK_SCHEDULE) {
    await simulateLatency(800);
    return mockScheduleResponse(request);
  }
  return postJson(SCHEDULE_URL, request);
}

export async function rewriteMessage({ rawMessage, patient, fallbackRewrite }) {
  if (SHOULD_MOCK_REWRITE) {
    await simulateLatency(900);
    return { rewritten: fallbackRewrite };
  }
  return postJson(REWRITE_URL, { rawMessage, patient });
}

export const mockMode = {
  schedule: SHOULD_MOCK_SCHEDULE,
  rewrite: SHOULD_MOCK_REWRITE,
  register: SHOULD_MOCK_REGISTER,
  recommend: SHOULD_MOCK_RECOMMEND,
};
