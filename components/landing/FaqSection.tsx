'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CalendarCheck, Check, Clock3, HeartPulse, LockKeyhole, Mail, MapPin, MessageCircle, Sparkles } from 'lucide-react'

export type FaqSectionProps = {  }

const faqs = [['Can the AI Assistant prescribe medications?', 'No, the AI provides clinic info, general health guidance, and schedules appointments. Prescriptions require physical examination by Dr. Alex Morgan.'], ['How do I confirm my booked appointment?', 'Once booked through the chatbot, you will automatically receive an email confirmation with all appointment details.'], ['What are the clinic timing and consultation fees?', 'Dr. Alex Morgan is available Mon-Fri, 5:00 PM - 9:00 PM. Consultation fee is $30 / PKR 3,000.'], ['Can I cancel or reschedule my appointment?', 'Yes, you can inform the AI assistant or contact the clinic desk directly via phone.']]

export function FaqSection({}) {
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  return (
<section id="faqs" className="scroll-mt-20 bg-slate-50 px-5 py-20 lg:px-8"><div className="mx-auto max-w-3xl"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Need to know</p><h2 className="mt-3 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">Frequently Asked Questions</h2></div><div className="mt-10 space-y-3">{faqs.map(([question, answer], i) => <div key={question} className="rounded-2xl border border-border bg-background"><button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="flex w-full items-center justify-between gap-4 p-5 text-left font-semibold text-slate-900"><span>{question}</span><span className="text-2xl font-normal text-emerald-600">{openFaq === i ? '−' : '+'}</span></button><AnimatePresence>{openFaq === i && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-6 text-muted-foreground">{answer}</p></motion.div>}</AnimatePresence></div>)}</div></div></section>
  )
}
