export const CLINICS = [
  {
    id: "chen-neurology",
    name: "Dr. Sarah Chen",
    specialty: "Neurology",
    path: "A",
    address: "Swedish Neuroscience Institute, 550 17th Ave, Seattle",
    phone: "206-555-0118",
  },
  {
    id: "reed-pt",
    name: "Dr. Marcus Reed",
    specialty: "Physical Therapy",
    path: "B",
    address: "Reed PT Associates, 1402 NE 65th St, Seattle",
    phone: "206-555-0144",
  },
  {
    id: "park-primarycare",
    name: "Dr. Lila Park",
    specialty: "Primary Care",
    path: "A",
    address: "Greenwood Family Health, 8523 Greenwood Ave N, Seattle",
    phone: "206-555-0167",
  },
];

export function findClinicById(id) {
  return CLINICS.find((c) => c.id === id) ?? null;
}
