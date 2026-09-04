import {

  CalendarCheck,

  Clock3,

  LockKeyhole,
  MessageCircle,

} from 'lucide-react'

const features = [
  {
    icon: CalendarCheck,
    title: 'Instant Appointment Booking',
    text: 'Real-time appointment assistance with direct clinic sync.',
  },
  {
    icon: Clock3,
    title: '24/7 Availability',
    text: 'Get answers about clinic timings, consultation fees, and appointments.',
  },
  {
    icon: MessageCircle,
    title: 'Personalized Chat History',
    text: 'Keep your questions and appointment details together.',
  },
  {
    icon: LockKeyhole,
    title: 'Strict Medical Privacy',
    text: 'Secure AI guardrails designed for your clinic workflow.',
  },
]

const steps = [
  ['01', 'Open the Assistant', 'Start a conversation instantly, with no account required.'],
  ['02', 'Chat with AI Assistant', 'Ask questions in English or Roman Urdu.'],
  ['03', 'Confirm Appointment Slot', 'Choose a suitable consultation type, date, and time.'],
  ['04', 'Instant Confirmation', 'Receive your appointment details after booking.'],
]

const testimonials = [
  [
    'Booking an appointment was seamless! The AI assistant answered all my questions about fees and timings instantly.',
    'Sarah K.',
  ],
  [
    'Saved me so much time waiting on phone calls. Received my confirmation details within seconds!',
    'Ahmed R.',
  ],
  [
    'Very smart assistant! It guided me clearly and helped me choose the right time slot.',
    'Dr. Fatima M.',
  ],
]

const faqs = [
  [
    'Can the AI Assistant prescribe medications?',
    'No. The AI assistant cannot diagnose conditions or prescribe medications. Medical treatment and prescriptions require consultation with Dr. Alex Morgan.',
  ],
  [
    'How do I book an appointment?',
    'Open the AI Assistant and tell it that you would like to book an appointment. It will guide you through the required information step by step.',
  ],
  [
    'What are the consultation fees?',
    'Online consultation is $20 for up to 20 minutes. Physical consultation is $50.',
  ],
  [
    'What are the clinic timings?',
    'Dr. Alex Morgan is available Monday through Friday from 5:00 PM to 9:00 PM.',
  ],
]

const navItems = [
  ['Home', 'home'],
  ['Services', 'services'],
  ['About Doctor', 'about-doctor'],
  ['How It Works', 'how-it-works'],
  ['Testimonials', 'testimonials'],
  ['FAQs', 'faqs'],
  ['Contact', 'contact'],
]


export { features, steps, testimonials, faqs, navItems }