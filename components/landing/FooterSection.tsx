'use client'

export type FooterSectionProps = { navigate: (id: string) => void }

export function FooterSection({ navigate }: FooterSectionProps) {
  return (
<footer className="border-t border-border bg-slate-100 px-5 py-10 lg:px-8"><div className="mx-auto flex max-w-7xl flex-col gap-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between"><div><button onClick={() => navigate('home')} className="font-semibold text-slate-900">Dr. Care <span className="text-emerald-600">AI</span></button><p className="mt-2">© 2026 Dr. Care AI. All rights reserved.</p></div><div className="flex flex-wrap gap-4">{[['Services', 'services'], ['About Doctor', 'about-doctor'], ['How It Works', 'how-it-works'], ['Testimonials', 'testimonials'], ['FAQs', 'faqs'], ['Contact', 'contact']].map(([label, id]) => <button key={id} onClick={() => navigate(id)} className="hover:text-emerald-600">{label}</button>)}</div><p className="max-w-xs text-xs leading-5">Medical disclaimer: AI guidance is informational and does not replace professional medical advice.</p></div></footer>
  )
}
