"use client";

import { useState } from "react";
import { Check, Send, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export type ContactSectionProps = {
  formSent: boolean;
  setFormSent: (sent: boolean) => void;
};

export type ContactFormData = {
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
};

export function ContactSection({ formSent, setFormSent }: ContactSectionProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const formElement = e.currentTarget;
    const formData = new FormData(formElement);

    const name = (formData.get("name") as string) || "";
    const email = (formData.get("email") as string) || "";
    const rawPhone = formData.get("phone") as string;
    const phone = rawPhone?.trim() ? rawPhone : null;
    const subject = (formData.get("subject") as string) || "";
    const message = (formData.get("message") as string) || "";

    const payload: ContactFormData = {
      name,
      email,
      phone,
      subject,
      message,
    };

    try {
      const { error } = await supabase.from("contact_messages").insert([payload]);

      if (error) {
        throw error;
      }

      setFormSent(true);

      // Reset form after 8 seconds
      setTimeout(() => {
        formElement.reset();
        setFormSent(false);
      }, 8000);

    } catch (err: unknown) {
      console.error("Error submitting contact form:", err);
      
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else if (typeof err === "object" && err !== null && "message" in err) {
        setErrorMessage(String((err as { message: unknown }).message));
      } else {
        setErrorMessage("Failed to send message. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="scroll-mt-20 px-5 py-20 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
            We&apos;re here to help
          </p>
          <h2 className="mt-3 font-sans text-3xl font-bold text-slate-900 sm:text-4xl">
            Get in Touch with Us
          </h2>
          <p className="mt-4 text-muted-foreground">
            Have a specific query or direct message for the clinic? Fill out the
            form below.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid gap-5 rounded-3xl border-2 border-emerald-200 bg-background p-6 shadow-lg shadow-emerald-900/5 sm:grid-cols-2 sm:p-8"
        >
          <label className="text-sm font-semibold text-slate-800">
            Full Name
            <input
              required
              name="name"
              disabled={loading || formSent}
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none transition focus:border-emerald-500 disabled:opacity-50"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Email Address
            <input
              required
              type="email"
              name="email"
              disabled={loading || formSent}
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none transition focus:border-emerald-500 disabled:opacity-50"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Phone Number
            <input
              name="phone"
              disabled={loading || formSent}
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none transition focus:border-emerald-500 disabled:opacity-50"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800">
            Subject
            <input
              required
              name="subject"
              disabled={loading || formSent}
              className="mt-2 w-full rounded-xl border border-border px-4 py-3 font-normal outline-none transition focus:border-emerald-500 disabled:opacity-50"
            />
          </label>
          <label className="text-sm font-semibold text-slate-800 sm:col-span-2">
            Message
            <textarea
              required
              name="message"
              rows={5}
              disabled={loading || formSent}
              className="mt-2 w-full resize-none rounded-xl border border-border px-4 py-3 font-normal outline-none transition focus:border-emerald-500 disabled:opacity-50"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={loading || formSent}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 text-sm font-semibold text-primary-foreground transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <>
                  Sending... <Loader2 size={17} className="animate-spin" />
                </>
              ) : formSent ? (
                <>
                  Message Sent <Check size={17} />
                </>
              ) : (
                <>
                  Send Message <Send size={17} />
                </>
              )}
            </button>

            {/* SUCCESS MESSAGE */}
            {formSent && (
              <p className="mt-3 text-sm font-medium text-emerald-700">
                Message Sent! You will be contacted soon on email.
              </p>
            )}

            {/* ERROR MESSAGE */}
            {errorMessage && (
              <p className="mt-3 text-sm font-medium text-red-600">
                {errorMessage}
              </p>
            )}
          </div>
        </form>
      </div>
    </section>
  );
}