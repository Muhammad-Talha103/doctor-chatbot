"use client";

import { useEffect, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HeroSection } from "@/components/landing/HeroSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { DoctorSection } from "@/components/landing/DoctorSection";
import { HowItWorksSection } from "@/components/landing/HowItWorksSection";
import { TestimonialsSection } from "@/components/landing/TestimonialsSection";
import { FaqSection } from "@/components/landing/FaqSection";
import { ContactSection } from "@/components/landing/ContactSection";
import { FooterSection } from "@/components/landing/FooterSection";
import {
  Menu,
  MessageCircle,
  Maximize2,
  Send,
  Stethoscope,
  X,
} from "lucide-react";

interface MessageItem {
  role: "user" | "assistant";
  content: string;
}

const STORAGE_KEY = "dr_care_chat_messages";

const navItems = [
  ["Home", "home"],
  ["Services", "services"],
  ["About Doctor", "about-doctor"],
  ["How It Works", "how-it-works"],
  ["Testimonials", "testimonials"],
  ["FAQs", "faqs"],
  ["Contact", "contact"],
];

export default function Page() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [formSent, setFormSent] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Load chat history from LocalStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setMessages(parsed);
        }
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  }, []);

  // Prevent scrolling when mobile menu is open
useEffect(() => {
  if (mobileOpen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  return () => {
    document.body.style.overflow = "";
  };
}, [mobileOpen]);

  // Save chat history to LocalStorage
  const updateAndSaveMessages = (newMsgs: MessageItem[]) => {
    setMessages(newMsgs);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newMsgs));
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  };

  // Expand Chat using Client-Side Navigation
  function expandChat() {
    updateAndSaveMessages(messages);
    router.push("/full-screen-chatbot");
  }

  function navigate(id: string) {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
    setMobileOpen(false);
  }

  async function sendMessage() {
    const content = message.trim();
    if (!content || loading) return;

    const userMsg: MessageItem = { role: "user", content };
    const updatedMessages = [...messages, userMsg];

    updateAndSaveMessages(updatedMessages);
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to fetch response");
      }

      const assistantMsg: MessageItem = {
        role: "assistant",
        content: data.text || "I could not process that request.",
      };

      updateAndSaveMessages([...updatedMessages, assistantMsg]);
    } catch (error) {
      console.error("Chat Error:", error);
      updateAndSaveMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content:
            "The assistant is temporarily unavailable. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen overflow-hidden bg-background text-foreground">
      <header className="relative z-20 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-8">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 font-sans text-lg font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-primary-foreground shadow-lg shadow-emerald-600/20">
              <Stethoscope size={18} />
            </span>
            Dr. Care <span className="text-emerald-600">AI</span>
          </button>

          {/* DESKTOP NAV ITEMS WITH WATER WAVE HOVER EFFECT */}
          <nav className="hidden items-center gap-2 text-sm font-medium text-muted-foreground lg:flex">
            {navItems.map(([label, id]) => (
              <button
                key={id}
                onClick={() => navigate(id)}
                className="group relative cursor-pointer overflow-hidden rounded-xl px-4 py-2 transition-colors duration-300 hover:text-emerald-900 dark:hover:text-emerald-100"
              >
                {/* Water Liquid Rise Effect */}
                <span className="absolute inset-0 translate-y-full rounded-xl bg-emerald-100/80 transition-transform duration-300 ease-out group-hover:translate-y-0 dark:bg-emerald-950/60" />
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </nav>

          <button
            onClick={() => setChatOpen(true)}
            className="hidden rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-md shadow-emerald-600/20 transition hover:bg-emerald-700 sm:block"
          >
            Start Chat
          </button>

          <button
            aria-label="Open menu"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="relative z-50 rounded-lg p-2 text-foreground lg:hidden"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* FULL SCREEN MOBILE NAV WITH SLIDE IN FROM RIGHT */}
<AnimatePresence>
  {mobileOpen && (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className="fixed inset-0 z-40 flex h-screen flex-col justify-between overflow-y-auto bg-white px-6 pb-10 pt-24 touch-none dark:bg-slate-950 lg:hidden"
    >
      <nav className="flex flex-col gap-3">
        {navItems.map(([label, id]) => (
          <button
            key={id}
            onClick={() => navigate(id)}
            className="group relative overflow-hidden rounded-2xl p-4 text-left text-lg font-semibold text-slate-900 transition-colors duration-300 hover:text-emerald-900 dark:text-slate-100 dark:hover:text-emerald-100"
          >
            {/* Water Fill Animation */}
            <span className="absolute inset-0 translate-y-full rounded-2xl bg-emerald-500/15 transition-transform duration-300 ease-out group-hover:translate-y-0 dark:bg-emerald-500/25" />
            <span className="relative z-10 flex items-center justify-between">
              {label}
              <span className="-translate-x-2 text-xs font-normal opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100">
                →
              </span>
            </span>
          </button>
        ))}
      </nav>

      <div className="mt-6 flex flex-col gap-4">
        <button
          onClick={() => {
            setChatOpen(true);
            setMobileOpen(false);
          }}
          className="w-full rounded-2xl bg-emerald-600 py-4 font-semibold text-white shadow-lg shadow-emerald-600/25 transition active:scale-[0.98]"
        >
          Start Chat
        </button>
      </div>
    </motion.div>
  )}
</AnimatePresence>
      </header>

      <HeroSection setChatOpen={setChatOpen} navigate={navigate} />
      <ServicesSection />
      <DoctorSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <FaqSection />
      <ContactSection formSent={formSent} setFormSent={setFormSent} />
      <FooterSection navigate={navigate} />

      <button
        aria-label="Open AI consultation"
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-primary-foreground shadow-xl shadow-emerald-600/30 transition hover:scale-105"
      >
        <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-20" />
        <MessageCircle size={24} />
      </button>

      <AnimatePresence>
        {chatOpen && (
          <motion.aside
            initial={{ opacity: 0, y: 30, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 30, x: 20 }}
            className="fixed bottom-5 right-5 z-40 flex h-[min(600px,calc(100vh-7rem))] w-[min(390px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl"
          >
            {/* CHAT HEADER */}
            <div className="flex items-center justify-between bg-emerald-600 px-5 py-4 text-primary-foreground">
              <div>
                <p className="font-semibold">Doctor&apos;s Assistant</p>
                <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-50">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-300" />{" "}
                  Online now
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* Full Screen Button with Hover Tooltip */}
                <div className="group relative flex items-center justify-center">
                  <button
                    aria-label="Open full-screen chat"
                    onClick={expandChat}
                    className="cursor-pointer p-1 text-primary-foreground/90 transition-colors hover:text-white"
                  >
                    <Maximize2 size={18} />
                  </button>

                  {/* Hover Label Positioned Below Icon */}
                  <span className="pointer-events-none absolute top-full mt-2 hidden whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block dark:bg-slate-100 dark:text-slate-900">
                    Full Screen
                  </span>
                </div>

                {/* Close Button */}
                <button
                  aria-label="Close chat"
                  onClick={() => setChatOpen(false)}
                  className="p-1 text-primary-foreground/90 transition-colors hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* MESSAGES BODY */}
            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-emerald-50 p-4 text-sm leading-6 text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                Hello! Main Dr. Alex Morgan ka AI Assistant hu. Aap clinic
                timings, fees, ya appointment booking ke hawale se koi bhi sawal
                pooch sakte hain.
              </div>

              {messages.map((item, i) => (
                <div
                  key={i}
                  className={`flex ${
                    item.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-3.5 text-sm leading-6 shadow-sm ${
                      item.role === "user"
                        ? "rounded-tr-none bg-emerald-600 text-white"
                        : "rounded-tl-none bg-emerald-50 text-slate-800 dark:bg-slate-800 dark:text-slate-100"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))}

              {/* ANIMATED TYPING INDICATOR */}
              {loading && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-none bg-emerald-50 px-4 py-3 dark:bg-slate-800">
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce dark:bg-emerald-400"
                      style={{ animationDelay: "0ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce dark:bg-emerald-400"
                      style={{ animationDelay: "150ms" }}
                    />
                    <span
                      className="h-2 w-2 rounded-full bg-emerald-600 animate-bounce dark:bg-emerald-400"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* INPUT AREA */}
            <div className="border-t border-border p-4">
              <div className="flex items-center gap-2 rounded-xl border border-border p-2 focus-within:border-emerald-600">
                <input
                  aria-label="Chat message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.nativeEvent.isComposing &&
                      e.keyCode !== 229
                    ) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  placeholder="Ask about appointments..."
                  disabled={loading}
                  className="min-w-0 flex-1 bg-transparent px-2 text-sm outline-none disabled:opacity-50"
                />
                <button
                  aria-label="Send message"
                  onClick={sendMessage}
                  disabled={!message.trim() || loading}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-primary-foreground disabled:opacity-50"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </main>
  );
}