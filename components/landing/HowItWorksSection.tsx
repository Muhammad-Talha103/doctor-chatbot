'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CalendarCheck, Check, Clock3, HeartPulse, LockKeyhole, Mail, MapPin, MessageCircle, Sparkles } from 'lucide-react'

export type HowItWorksSectionProps = {  }

export function HowItWorksSection({}) {
  return (
<section id="how-it-works" className="scroll-mt-20 bg-slate-50 px-5 py-20 lg:px-8"><div className="mx-auto max-w-7xl"><div className="text-center"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Your next step</p><h2 className="mt-3 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">How it works</h2></div><div className="mt-12 grid gap-4 md:grid-cols-4">{[['01', 'Open the Assistant', 'Start a conversation instantly, with no account required.'], ['02', 'Chat with AI Assistant', 'Ask questions in English or Roman Urdu.'], ['03', 'Confirm Appointment Slot', 'Choose a time that works for you.'], ['04', 'Instant Email Confirmation', 'Receive your appointment details instantly.']].map(([number, title, text]) => <div key={number} className="relative rounded-2xl border border-border bg-background p-6"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-primary-foreground">{number}</span><h3 className="mt-6 font-semibold text-slate-900">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>)}</div></div></section>
  )
}
