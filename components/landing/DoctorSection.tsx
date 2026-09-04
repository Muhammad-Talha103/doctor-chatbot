'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CalendarCheck, Check, Clock3, HeartPulse, LockKeyhole, Mail, MapPin, MessageCircle, Sparkles } from 'lucide-react'

export type DoctorSectionProps = {  }

export function DoctorSection({}) {
  return (
<section id="about-doctor" className="scroll-mt-20 px-5 py-20 lg:px-8"><div className="mx-auto grid max-w-7xl gap-10 rounded-3xl border border-border bg-slate-50 p-5 sm:p-8 lg:grid-cols-[.85fr_1.15fr] lg:items-center lg:p-12"><div className="relative overflow-hidden rounded-2xl"><img src="/image.png" alt="Dr. Alex Morgan" className="aspect-[4/5] w-full object-cover shadow-lg" onError={(e) => { e.currentTarget.src = '/placeholder-user.jpg' }} /></div><div><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Meet your doctor</p><h2 className="mt-3 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">Dr. Alex Morgan</h2><p className="mt-2 font-medium text-cyan-600">MBBS, FCPS — Senior Consultant & Specialist</p><p className="mt-6 max-w-xl leading-7 text-muted-foreground">Dedicated to providing comprehensive healthcare and clinical expertise. Specialized in preventative care, general health consultations, and long-term wellness management.</p><div className="mt-8 grid gap-3 text-sm sm:grid-cols-3"><div className="rounded-xl bg-background p-4"><MapPin size={18} className="mb-3 text-emerald-600" /><span className="font-semibold">Location</span><p className="mt-1 leading-5 text-muted-foreground">Health Care Clinic, Suite 402</p></div><div className="rounded-xl bg-background p-4"><Clock3 size={18} className="mb-3 text-emerald-600" /><span className="font-semibold">Timings</span><p className="mt-1 leading-5 text-muted-foreground">Mon – Fri | 5 – 9 PM</p></div><div className="rounded-xl bg-background p-4"><HeartPulse size={18} className="mb-3 text-emerald-600" /><span className="font-semibold">Consultation</span><p className="mt-1 leading-5 text-muted-foreground">$30 / PKR 3,000</p></div></div></div></div></section>
  )
}
