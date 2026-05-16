export const CLINICS = [
  {
    id: "chen-neurology",
    name: "Dr. Sarah Chen",
    specialty: "Neurology",
    path: "A",
    address: "Swedish Neuroscience Institute, 550 17th Ave, Seattle",
    phone: "206-555-0118",
    keywords: [
      "neurology",
      "neurological",
      "headache",
      "migraine",
      "concussion",
      "post-concussion",
      "memory",
      "cognitive",
      "brain",
      "follow-up",
      "dizziness",
    ],
    defaultAppointmentType: "Neurology follow-up",
  },
  {
    id: "reed-pt",
    name: "Dr. Marcus Reed",
    specialty: "Physical Therapy",
    path: "B",
    address: "Reed PT Associates, 1402 NE 65th St, Seattle",
    phone: "206-555-0144",
    keywords: [
      "physical",
      "pt",
      "pain",
      "back",
      "neck",
      "shoulder",
      "mobility",
      "movement",
      "balance",
      "vestibular",
      "rehab",
      "evaluation",
    ],
    defaultAppointmentType: "Physical therapy initial evaluation",
  },
];

export function findClinicById(id) {
  return CLINICS.find((c) => c.id === id) ?? null;
}
