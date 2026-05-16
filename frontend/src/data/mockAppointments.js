import { CLINICS } from "./mockClinics.js";

const chen = CLINICS.find((c) => c.id === "chen-neurology");
const reed = CLINICS.find((c) => c.id === "reed-pt");

export const INITIAL_APPOINTMENTS = [
  {
    id: "apt-seed-001",
    patientId: "patient-001",
    clinic: chen,
    appointmentType: "Neurology follow-up",
    status: "scheduled",
    path: "A",
    createdAt: "2026-05-12T15:20:00Z",
    updatedAt: "2026-05-12T15:20:01Z",
    appointmentTime: "Tue May 19, 2026 — 2:30 PM",
    confirmationCode: "NS-2026-00481",
    location: "Swedish Neuroscience Institute, 550 17th Ave, Seattle",
  },
  {
    id: "apt-seed-002",
    patientId: "patient-001",
    clinic: reed,
    appointmentType: "Physical therapy initial evaluation",
    status: "in_progress",
    path: "B",
    createdAt: "2026-05-15T14:10:00Z",
    updatedAt: "2026-05-15T14:10:14Z",
    emailDraft:
      "Hello Reed PT Associates,\n\n" +
      "I am writing on behalf of Alex Rivera to request a physical therapy initial evaluation, ideally within the next two weeks. Morning appointments are strongly preferred.\n\n" +
      "Alex is a TBI survivor and communicates most effectively by email. Please reply to alex.rivera@example.com with available times.\n\n" +
      "Thank you,\n" +
      "NeuroSync Health, on behalf of Alex Rivera",
    awaitingResponseSince: "2026-05-15T14:10:14Z",
  },
];
