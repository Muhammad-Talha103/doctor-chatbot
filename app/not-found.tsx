"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Home, Stethoscope, Search, RefreshCw } from "lucide-react";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f4fbfa] px-4 text-[#12383a]">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            x: [0, 30, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 size-96 rounded-full bg-[#00a7a0]/15 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -40, 0],
            y: [0, 40, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 size-96 rounded-full bg-[#008e89]/15 blur-3xl"
        />
      </div>

      {/* Main Container */}
      <div className="relative z-10 mx-auto w-full max-w-lg text-center">
        {/* Animated Stethoscope & Pulse Graphic */}
        <div className="relative mb-8 flex justify-center">
          {/* Heartbeat Line Animation Backdrop */}
          <div className="absolute inset-x-0 top-1/2 -z-10 flex -translate-y-1/2 items-center justify-center opacity-25">
            <svg
              className="h-16 w-full max-w-xs text-[#00a7a0]"
              viewBox="0 0 300 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M 0 50 L 80 50 L 95 20 L 115 80 L 135 10 L 155 90 L 170 50 L 300 50" />
            </svg>
          </div>

          {/* Center Floating Icon Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="relative"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="grid size-24 place-items-center rounded-3xl bg-white shadow-xl shadow-[#00a7a0]/10 border border-[#dcefed]"
            >
              <div className="grid size-16 place-items-center rounded-2xl bg-[#00a7a0] text-white shadow-md">
                <Stethoscope size={36} />
              </div>
            </motion.div>

            {/* Pulse Ring */}
            <motion.span
              animate={{ scale: [1, 1.4, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 -z-10 rounded-3xl bg-[#00a7a0]/30"
            />
          </motion.div>
        </div>

        {/* 404 Text Animation */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dcefed] bg-white px-3.5 py-1 text-xs font-semibold text-[#008e89] shadow-2xs">
            <span className="size-2 rounded-full bg-[#00a7a0] animate-pulse" />
            Error 404
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl text-[#12383a]">
            Page Not Found
          </h1>

          <p className="mt-3 text-sm text-[#789a9a] sm:text-base leading-relaxed">
            The diagnosis is in: the route you are trying to access doesn't exist or has been moved.
          </p>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center"
        >
          

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#00a7a0] px-5 py-3 text-sm font-semibold text-white shadow-md shadow-[#00a7a0]/20 transition hover:bg-[#008e89]"
          >
            <Home size={18} />
          Home
          </Link>
        </motion.div>

       
      </div>
    </main>
  );
}