export interface Appointment {
  id: number;
  patient_name: string;
  patient_email: string;
  patient_phone: string;
  whatsapp_number: string;
  patient_location: string;
  disease_summary: string;
  appointment_date: string;
  appointment_time: string;
  status: "Pending" | "Confirmed" | "Completed" | "Cancelled";
  payment_method: string;
  payment_status: "Paid" | "Pending" | "Failed";
  appointment_type: "Online Consultation" | "In-Person";
  created_at: string;
}

export const appointments: Appointment[] = [
  
  
  {
    id: 3,
    patient_name: "Fatima Noor",
    patient_email: "fatima.noor@gmail.com",
    patient_phone: "+92 333 6412200",
    whatsapp_number: "+92 333 6412200",
    patient_location: "Karachi, Pakistan",
    disease_summary: "Seasonal allergy symptoms and mild cough.",
    appointment_date: "Sep 10, 2026",
    appointment_time: "05:00 PM",
    status: "Completed",
    payment_method: "Cash",
    payment_status: "Paid",
    appointment_type: "In-Person",
    created_at: "Sep 01, 2026 · 11:06 AM",
  },
  {
    id: 4,
    patient_name: "Michael Miller",
    patient_email: "michael.miller@gmail.com",
    patient_phone: "+1 212 555 0198",
    whatsapp_number: "+1 212 555 0148",
    patient_location: "New York, USA",
    disease_summary: "Chronic lower back pain radiating down the left leg; requesting second opinion on lumbar MRI.",
    appointment_date: "Sep 11, 2026",
    appointment_time: "03:00 PM",
    status: "Confirmed",
    payment_method: "Credit Card",
    payment_status: "Paid",
    appointment_type: "In-Person",
    created_at: "Sep 03, 2026 · 02:15 PM",
  },
  {
    id: 5,
    patient_name: "Sipho Ndlovu",
    patient_email: "sipho.ndlovu@yahoo.com",
    patient_phone: "+27 11 987 6543",
    whatsapp_number: "+27 11 987 6543",
    patient_location: "Johannesburg, South Africa",
    disease_summary: "Persistent acid reflux and epigastric discomfort over the last three months.",
    appointment_date: "Sep 12, 2026",
    appointment_time: "04:30 PM",
    status: "Pending",
    payment_method: "PayPal",
    payment_status: "Paid",
    appointment_type: "Online Consultation",
    created_at: "Sep 02, 2026 · 09:10 AM",
  },

  
 
  
  {
    id: 10,
    patient_name: "James Wilson",
    patient_email: "j.wilson@gmail.com",
    patient_phone: "+1 415 555 0119",
    whatsapp_number: "+1 415 555 1137",
    patient_location: "San Francisco, USA",
    disease_summary: "Routine cardiovascular check-up and discussion regarding cholesterol management medication.",
    appointment_date: "Sep 17, 2026",
    appointment_time: "10:00 AM",
    status: "Confirmed",
    payment_method: "Stripe",
    payment_status: "Paid",
    appointment_type: "In-Person",
    created_at: "Aug 30, 2026 · 01:50 PM",
  },
  
  {
    id: 12,
    patient_name: "Chen Wei",
    patient_email: "chen.wei@foxmail.com",
    patient_phone: "+86 20 8123 9876",
    whatsapp_number: "+86 20 8123 9876",
    patient_location: "Guangzhou, China",
    disease_summary: "Pediatric tele-consultation for 5-year-old child experiencing recurrent ear infections.",
    appointment_date: "Sep 19, 2026",
    appointment_time: "04:00 PM",
    status: "Pending",
    payment_method: "Bank Transfer",
    payment_status: "Pending",
    appointment_type: "Online Consultation",
    created_at: "Aug 28, 2026 · 04:05 PM",
  },
];
