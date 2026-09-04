'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, LockKeyhole, Stethoscope, ShieldCheck } from 'lucide-react'

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

export default function AdminLoginPage() {
  const [pin, setPin] = useState(Array(8).fill(''))
  const [status, setStatus] = useState<'idle' | 'success' | 'error' | 'already_logged_in'>('idle')
  const [countdown, setCountdown] = useState(4)
  const refs = useRef<Array<HTMLInputElement | null>>([])

  // Check if already authenticated on mount
  useEffect(() => {
    const isAuthenticated = sessionStorage.getItem('admin_authenticated') === 'true'
    if (isAuthenticated) {
      setStatus('already_logged_in')
    } else {
      refs.current[0]?.focus()
    }
  }, [])

  // Countdown and Auto-Redirect for Already Logged In State
  useEffect(() => {
    if (status !== 'already_logged_in') return

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = '/admin'
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [status])

  function updatePin(index: number, value: string) {
    if (status !== 'idle') setStatus('idle')
    const digit = value.replace(/\D/g, '').slice(-1)
    const next = [...pin]
    next[index] = digit
    setPin(next)
    if (digit && index < 7) refs.current[index + 1]?.focus()
    if (next.join('').length === 8) submit(next.join(''))
  }

  function onKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Backspace' && !pin[index] && index > 0) refs.current[index - 1]?.focus()
  }

  function submit(value = pin.join('')) {
    if (value === ADMIN_PIN) {
      setStatus('success')
      sessionStorage.setItem('admin_authenticated', 'true')
      setTimeout(() => { window.location.href = '/admin' }, 1500)
    } else {
      setStatus('error')
    }
  }

  return (
    <main className="min-h-screen bg-[#f4fbfa] px-6 py-10 text-[#12383a]">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-md flex-col justify-center">
        <a 
          href="/" 
          className="mb-12 inline-flex items-center gap-2 text-sm text-[#789a9a] transition hover:text-[#00a7a0]"
        >
          <ArrowLeft size={16} /> Back to Dr. Care AI
        </a>
        
        <div className="mb-8 flex items-center gap-3">
          <div className="grid size-11 place-items-center rounded-2xl bg-[#00a7a0] text-white shadow-md shadow-[#00a7a0]/20">
            <Stethoscope size={23} />
          </div>
          <div>
            <p className="font-semibold text-[#12383a]">Dr. Care AI</p>
            <p className="text-xs text-[#789a9a]">Admin portal</p>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 18 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="rounded-3xl border border-[#dcefed] bg-white p-7 shadow-xl shadow-[#12383a]/5 sm:p-9"
        >
          <div className="mb-8">
            <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-[#e5f8f6] text-[#00a7a0]">
              <LockKeyhole size={22} />
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-[#12383a]">Welcome back</h1>
            <p className="mt-2 text-sm leading-6 text-[#789a9a]">Enter your 8-digit admin access PIN to continue.</p>
          </div>

          <motion.div 
            animate={status === 'error' ? { x: [-10, 10, -8, 8, -4, 4, 0] } : {}}
            transition={{ duration: 0.4 }}
            className="mb-7 grid grid-cols-8 gap-2"
          >
            {pin.map((digit, index) => (
              <motion.input 
                key={index} 
                ref={(el) => { refs.current[index] = el }} 
                value={digit} 
                onChange={(e) => updatePin(index, e.target.value)} 
                onKeyDown={(e) => onKeyDown(index, e)} 
                inputMode="numeric" 
                maxLength={1} 
                aria-label={`PIN digit ${index + 1}`} 
                animate={digit ? { scale: [1, 1.08, 1] } : {}} 
                className={`h-12 w-full rounded-xl border text-center text-lg font-semibold outline-none transition ${
                  status === 'error' 
                    ? 'border-red-400 bg-red-50 text-red-600 focus:ring-2 focus:ring-red-400/20' 
                    : 'border-[#dcefed] bg-[#f4fbfa] text-[#12383a] focus:border-[#00a7a0] focus:bg-white focus:ring-2 focus:ring-[#00a7a0]/20'
                }`} 
              />
            ))}
          </motion.div>

          <button 
            onClick={() => submit()} 
            disabled={status === 'success' || status === 'already_logged_in'} 
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#00a7a0] text-white font-semibold transition hover:bg-[#008e89] disabled:opacity-80"
          >
            Sign In
          </button>

    
        </motion.div>
      </div>

      {/* Animated Feedback Modal */}
      <AnimatePresence>
        {status !== 'idle' && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-[#12383a]/30 p-4 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 10 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.8, opacity: 0, y: 10 }}
              className="flex flex-col items-center rounded-3xl border border-[#dcefed] bg-white p-8 text-center shadow-2xl max-w-xs w-full"
            >
              {status === 'already_logged_in' && (
                <>
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }} 
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="mb-4 grid size-16 place-items-center rounded-full bg-[#e5f8f6] text-[#00a7a0]"
                  >
                    <ShieldCheck size={36} />
                  </motion.div>
                  <h3 className="text-xl font-bold text-[#12383a]">Already Logged In</h3>
                  <p className="mt-1 text-sm text-[#789a9a]">You are already authenticated in this session.</p>
                  
                  <div className="mt-4 flex items-center gap-2 rounded-xl bg-[#f4fbfa] px-4 py-2 border border-[#dcefed]">
                    <span className="relative flex size-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00a7a0] opacity-75"></span>
                      <span className="relative inline-flex size-2.5 rounded-full bg-[#00a7a0]"></span>
                    </span>
                    <p className="text-xs font-medium text-[#12383a]">
                      Redirecting in <span className="font-bold text-[#00a7a0]">{countdown}s</span>...
                    </p>
                  </div>
                </>
              )}

              {status === 'success' && (
                <>
                  <div className="mb-4 grid size-16 place-items-center rounded-full bg-[#e5f8f6] text-[#00a7a0]">
                    <svg className="size-9 stroke-[#00a7a0]" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path 
                        d="M20 6L9 17l-5-5" 
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ duration: 0.5, ease: "easeOut" }} 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#12383a]">Login Successful</h3>
                  <p className="mt-1 text-sm text-[#789a9a]">Redirecting to dashboard...</p>
                </>
              )}

              {status === 'error' && (
                <>
                  <div className="mb-4 grid size-16 place-items-center rounded-full bg-red-50 text-red-500">
                    <svg className="size-9 stroke-red-500" viewBox="0 0 24 24" fill="none" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <motion.path 
                        d="M18 6L6 18" 
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ duration: 0.3 }} 
                      />
                      <motion.path 
                        d="M6 6l12 12" 
                        initial={{ pathLength: 0 }} 
                        animate={{ pathLength: 1 }} 
                        transition={{ duration: 0.3, delay: 0.15 }} 
                      />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-[#12383a]">Incorrect PIN</h3>
                  <p className="mt-1 text-sm text-[#789a9a]">Please check your PIN and try again.</p>
                  <button 
                    onClick={() => setStatus('idle')} 
                    className="mt-5 w-full rounded-xl bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
                  >
                    Try Again
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}