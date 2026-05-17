// Keep in sync with backend/lambdas/recommend/index.mjs and frontend/src/data/mockClinics.js.
// Path A (instant booking) vs Path B (email draft) is randomized per call.
// Insurance is not used here — it only drives recommendation, not scheduling.
const CLINICS = {
  "chen-neurology": {
    id: "chen-neurology",
    name: "Dr. Sarah Chen",
    specialty: "Neurology",
    address: "Swedish Neuroscience Institute, 550 17th Ave, Seattle",
    phone: "206-555-0118",
    defaultAppointmentType: "Neurology follow-up",
  },
  "nguyen-neurology": {
    id: "nguyen-neurology",
    name: "Dr. Lan Nguyen",
    specialty: "Neurology",
    address: "Northgate Neurology Center, 11000 Roosevelt Way NE, Seattle",
    phone: "206-555-0211",
    defaultAppointmentType: "Neurology follow-up",
  },
  "reed-pt": {
    id: "reed-pt",
    name: "Dr. Marcus Reed",
    specialty: "Physical Therapy",
    address: "Reed PT Associates, 1402 NE 65th St, Seattle",
    phone: "206-555-0144",
    defaultAppointmentType: "Physical therapy initial evaluation",
  },
  "patel-pt": {
    id: "patel-pt",
    name: "Dr. Priya Patel",
    specialty: "Physical Therapy",
    address: "Alki Movement Therapy, 4100 SW Alaska St, Seattle",
    phone: "206-555-0222",
    defaultAppointmentType: "Physical therapy initial evaluation",
  },
  "okafor-speech": {
    id: "okafor-speech",
    name: "Dr. Amara Okafor",
    specialty: "Speech-Language Pathology",
    address: "Okafor Speech & Language Clinic, 2100 Westlake Ave, Seattle",
    phone: "206-555-0166",
    defaultAppointmentType: "Speech therapy evaluation",
  },
  "lin-speech": {
    id: "lin-speech",
    name: "Dr. Wei Lin",
    specialty: "Speech-Language Pathology",
    address: "Ballard Voice & Speech Center, 5505 24th Ave NW, Seattle",
    phone: "206-555-0233",
    defaultAppointmentType: "Speech therapy evaluation",
  },
  "tanaka-ot": {
    id: "tanaka-ot",
    name: "Dr. Yuki Tanaka",
    specialty: "Occupational Therapy",
    address: "Tanaka OT Partners, 815 E Pine St, Seattle",
    phone: "206-555-0177",
    defaultAppointmentType: "Occupational therapy initial evaluation",
  },
  "brooks-ot": {
    id: "brooks-ot",
    name: "Dr. Elena Brooks",
    specialty: "Occupational Therapy",
    address: "Beacon Hill OT Studio, 2900 Beacon Ave S, Seattle",
    phone: "206-555-0244",
    defaultAppointmentType: "Occupational therapy initial evaluation",
  },
  "ortiz-mentalhealth": {
    id: "ortiz-mentalhealth",
    name: "Dr. Mateo Ortiz",
    specialty: "Mental Health (Psychiatry & Therapy)",
    address: "Ortiz Behavioral Health, 600 Broadway, Seattle",
    phone: "206-555-0188",
    defaultAppointmentType: "Mental health consultation",
  },
  "wong-mentalhealth": {
    id: "wong-mentalhealth",
    name: "Dr. Hannah Wong",
    specialty: "Mental Health (Psychiatry & Therapy)",
    address: "Fremont Mind Clinic, 3601 Fremont Ave N, Seattle",
    phone: "206-555-0255",
    defaultAppointmentType: "Mental health consultation",
  },
  "kim-primary": {
    id: "kim-primary",
    name: "Dr. Jordan Kim",
    specialty: "Primary Care",
    address: "Kim Family Medicine, 1240 12th Ave, Seattle",
    phone: "206-555-0199",
    defaultAppointmentType: "Primary care visit",
  },
  "sato-primary": {
    id: "sato-primary",
    name: "Dr. Riku Sato",
    specialty: "Primary Care",
    address: "Greenwood Family Health, 8500 Greenwood Ave N, Seattle",
    phone: "206-555-0266",
    defaultAppointmentType: "Primary care visit",
  },
};

const JSON_HEADERS = { "Content-Type": "application/json" };

function errorResponse(status, code, message) {
  return {
    statusCode: status,
    headers: JSON_HEADERS,
    body: JSON.stringify({ error: { code, message } }),
  };
}

function newAppointmentId() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `apt-2026-${n}`;
}

function newConfirmationCode() {
  const n = Math.floor(Math.random() * 90000) + 10000;
  return `NS-2026-${n}`;
}

export const handler = async (event) => {
  let body;
  try {
    body = JSON.parse(event?.body || "{}");
  } catch {
    return errorResponse(400, "INVALID_JSON", "Request body must be JSON.");
  }

  const clinic = CLINICS[body.clinicId];
  if (!clinic) {
    return errorResponse(
      404,
      "CLINIC_NOT_FOUND",
      `No clinic registered with ID '${body.clinicId}'`
    );
  }

  const patient = body.patient ?? {};
  const appointmentType = body.appointmentType || clinic.defaultAppointmentType;
  const preferredTimeframe = body.preferredTimeframe || "";
  const now = new Date().toISOString();
  const path = Math.random() < 0.5 ? "A" : "B";

  const baseAppointment = {
    id: newAppointmentId(),
    patientId: patient.id,
    clinic,
    appointmentType,
    path,
    createdAt: now,
    updatedAt: now,
  };

  if (path === "A") {
    return {
      statusCode: 200,
      headers: JSON_HEADERS,
      body: JSON.stringify({
        path: "A",
        appointment: {
          ...baseAppointment,
          status: "scheduled",
          appointmentTime: "Tue May 19, 2026 — 2:30 PM",
          confirmationCode: newConfirmationCode(),
          location: clinic.address,
        },
      }),
    };
  }

  const firstName = patient.firstName ?? "";
  const lastName = patient.lastName ?? "";
  const fullName = `${firstName} ${lastName}`.trim();
  const recipient = clinic.name.replace(/^Dr\. /, "");
  const timeframeClause = preferredTimeframe || "in the coming weeks";
  const emailFor = patient.email || "the patient";

  const emailDraft =
    `Hello ${recipient} office,\n\n` +
    `I am writing on behalf of ${fullName} to request a ${appointmentType.toLowerCase()}, ideally ${timeframeClause}.\n\n` +
    `${firstName} is a TBI survivor and communicates most effectively by email. ` +
    `Morning appointments are strongly preferred. ` +
    `Please reply to ${emailFor} with available times.\n\n` +
    `Thank you,\n` +
    `NeuroSync Health, on behalf of ${fullName}`;

  return {
    statusCode: 200,
    headers: JSON_HEADERS,
    body: JSON.stringify({
      path: "B",
      appointment: {
        ...baseAppointment,
        status: "in_progress",
        emailDraft,
        awaitingResponseSince: now,
      },
    }),
  };
};
