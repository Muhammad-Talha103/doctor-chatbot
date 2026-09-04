'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CalendarCheck, Check, Clock3, HeartPulse, LockKeyhole, Mail, MapPin, MessageCircle, Sparkles } from 'lucide-react'

export type TestimonialsSectionProps = {  }

const testimonials = [['Booking an appointment was seamless! The AI assistant answered all my questions about fees and timings instantly.', 'Sarah K.'], ['Saved me so much time waiting on phone calls. Received my confirmation email within seconds!', 'Ahmed R.'], ['Very smart assistant! It guided me clearly and helped me choose the right time slot.', 'Dr. Fatima M.']]

export function TestimonialsSection({}) {
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  return (
<section id="testimonials" className="scroll-mt-20 px-5 py-20 lg:px-8"><div className="mx-auto max-w-4xl text-center"><p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">Real patient experiences</p><h2 className="mt-3 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">What Our Patients Say</h2><AnimatePresence mode="wait"><motion.div key={activeTestimonial} initial={{ opacity: 0, x: 25 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -25 }} className="mt-10 rounded-3xl border border-emerald-200 bg-emerald-50 p-8 shadow-sm sm:p-12"><div className="flex justify-center gap-1 text-emerald-600" aria-label="5 star rating">{'★★★★★'}</div><blockquote className="mt-6 text-xl font-medium leading-8 text-slate-800">&quot;{testimonials[activeTestimonial][0]}&quot;</blockquote><p className="mt-6 text-sm font-semibold text-emerald-700">— {testimonials[activeTestimonial][1]}</p></motion.div></AnimatePresence><div className="mt-6 flex justify-center gap-2">{testimonials.map((_, i) => <button key={i} aria-label={`Show testimonial ${i + 1}`} onClick={() => setActiveTestimonial(i)} className={`h-2.5 rounded-full transition-all ${i === activeTestimonial ? 'w-8 bg-emerald-600' : 'w-2.5 bg-emerald-200'}`} />)}</div></div></section>
  )
}
