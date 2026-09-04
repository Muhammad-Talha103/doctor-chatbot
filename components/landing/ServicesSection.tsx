'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CalendarCheck, Check, Clock3, HeartPulse, LockKeyhole, Mail, MapPin, MessageCircle, Sparkles } from 'lucide-react'

export type ServicesSectionProps = {  }

export function ServicesSection({}) {
  return (
<section id="services" className="scroll-mt-20 bg-slate-50 px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="max-w-xl"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Care, simplified</p><h2 className="mt-3 font-sans text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Why use our AI health assistant?</h2></div><div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[
  { icon: CalendarCheck, title: 'Instant Appointment Booking', text: 'Real-time slot booking with direct clinic sync.' },
  { icon: Clock3, title: '24/7 Availability', text: 'Get answers on clinic timings, fees, and general care.' },
  { icon: MessageCircle, title: 'Personalized Chat History', text: 'Keep your questions and appointment details together.' },
  { icon: LockKeyhole, title: 'Strict Medical Privacy', text: 'Secure guardrails built for your clinic workflow.' },
].map(({ icon: Icon, title, text }) => <motion.article whileHover={{ y: -5 }} key={title} className="rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:border-emerald-300"><div className="mb-8 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600"><Icon size={21} /></div><h3 className="font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p><span className="mt-6 block text-xs font-semibold text-emerald-600">Learn more <ArrowRight className="ml-1 inline" size={13} /></span></motion.article>)}</div></div></section>
  )
}
