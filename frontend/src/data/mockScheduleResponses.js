import { findClinicById } from "./mockClinics.js";

let counter = 500;

function nextId() {
  counter += 1;
  return `apt-2026-${String(counter).padStart(5, "0")}`;
}

function nextConfirmation() {
  return `NS-2026-${String(counter).padStart(5, "0")}`;
}

export function mockScheduleResponse(request) {
  const clinic = findClinicById(request.clinicId);
  if (!clinic) {
    const err = new Error(`No clinic registered with ID '${request.clinicId}'`);
    err.code = "CLINIC_NOT_FOUND";
    throw err;
  }

  const now = new Date().toISOString();
  const baseAppointment = {
    id: nextId(),
    patientId: request.patient.id,
    clinic,
    appointmentType: request.appointmentType,
    path: clinic.path,
    createdAt: now,
    updatedAt: now,
  };

  if (clinic.path === "A") {
    return {
      path: "A",
      appointment: {
        ...baseAppointment,
        status: "scheduled",
        appointmentTime: "Tue May 19, 2026 — 2:30 PM",
        confirmationCode: nextConfirmation(),
        location: clinic.address,
      },
    };
  }

  const firstName = request.patient.firstName;
  const emailDraft =
    `Hello ${clinic.name.replace(/^Dr\. /, "")} office,\n\n` +
    `I am writing on behalf of ${firstName} ${request.patient.lastName ?? ""}`.trimEnd() +
    ` to request a ${request.appointmentType.toLowerCase()}, ideally ${request.preferredTimeframe || "in the coming weeks"}.\n\n` +
    `${firstName} is a TBI survivor and communicates most effectively by email. ` +
    `Morning appointments are strongly preferred. ` +
    `Please reply to ${request.patient.email} with available times.\n\n` +
    `Thank you,\n` +
    `NeuroSync Health, on behalf of ${firstName} ${request.patient.lastName ?? ""}`.trimEnd();

  return {
    path: "B",
    appointment: {
      ...baseAppointment,
      status: "in_progress",
      emailDraft,
      awaitingResponseSince: now,
    },
  };
}
