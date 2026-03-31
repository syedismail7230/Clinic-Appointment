export const MOCK_CLINICS = [
  {
    id: "c1",
    name: "City Health Clinic",
    address: "123 Main St, Downtown",
    distance: "0.5 km",
    rating: 4.8,
    doctors: [
      { id: "d1", name: "Dr. Sarah Smith", specialty: "General Physician", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "11:30 AM"] },
      { id: "d2", name: "Dr. John Doe", specialty: "Pediatrician", availableSlots: ["10:00 AM", "10:30 AM", "02:00 PM"] }
    ]
  },
  {
    id: "c2",
    name: "Sunrise Medical Center",
    address: "456 Oak Ave, Westside",
    distance: "2.1 km",
    rating: 4.5,
    doctors: [
      { id: "d3", name: "Dr. Emily Chen", specialty: "Dermatologist", availableSlots: ["01:00 PM", "01:30 PM", "03:00 PM"] }
    ]
  }
];

export const MOCK_QUEUE = [
  { id: "q1", patientName: "Alice Brown", phone: "555-0101", status: "waiting", doctor: "Dr. Sarah Smith", time: "09:00 AM", waitTime: "15 mins" },
  { id: "q2", patientName: "Bob Wilson", phone: "555-0102", status: "in-consultation", doctor: "Dr. Sarah Smith", time: "08:30 AM", waitTime: "0 mins" },
  { id: "q3", patientName: "Charlie Davis", phone: "555-0103", status: "booked", doctor: "Dr. John Doe", time: "10:00 AM", waitTime: "45 mins" },
];

export const MOCK_APPOINTMENTS = [
  {
    id: "a1",
    patientName: "Alice Brown",
    phone: "555-0101",
    date: new Date().toISOString().split('T')[0],
    time: "09:00 AM",
    doctor: "Dr. Sarah Smith",
    status: "completed",
    notes: "Patient reported mild fever and cough for 3 days.",
    tags: ["Fever", "Follow-up"],
    history: [
      { date: "2023-10-12", doctor: "Dr. Sarah Smith", notes: "Annual checkup. All clear." }
    ]
  },
  {
    id: "a2",
    patientName: "Bob Wilson",
    phone: "555-0102",
    date: new Date().toISOString().split('T')[0],
    time: "09:30 AM",
    doctor: "Dr. Sarah Smith",
    status: "in-consultation",
    notes: "Routine blood pressure check.",
    tags: ["Hypertension"],
    history: [
      { date: "2023-11-05", doctor: "Dr. Sarah Smith", notes: "Prescribed BP meds." },
      { date: "2023-09-10", doctor: "Dr. Sarah Smith", notes: "Initial diagnosis of hypertension." }
    ]
  },
  {
    id: "a3",
    patientName: "Charlie Davis",
    phone: "555-0103",
    date: new Date().toISOString().split('T')[0],
    time: "10:00 AM",
    doctor: "Dr. John Doe",
    status: "booked",
    notes: "Vaccination.",
    tags: ["Pediatrics", "Vaccine"],
    history: []
  },
  {
    id: "a4",
    patientName: "Diana Prince",
    phone: "555-0104",
    date: new Date().toISOString().split('T')[0],
    time: "11:00 AM",
    doctor: "Dr. John Doe",
    status: "no-show",
    notes: "",
    tags: [],
    history: []
  },
  {
    id: "a5",
    patientName: "Evan Wright",
    phone: "555-0105",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    time: "09:00 AM",
    doctor: "Dr. Sarah Smith",
    status: "booked",
    notes: "General consultation.",
    tags: ["First Time"],
    history: []
  }
];
