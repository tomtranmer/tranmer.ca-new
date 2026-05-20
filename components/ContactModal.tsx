"use client";

import { useState } from "react";

export type ContactModalProps = {
  label: string;
  emoji: string;
  gradient: string;
  onModalChange?: (isOpen: boolean) => void;
};

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactModal({ label, emoji, gradient, onModalChange }: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const openModal = () => {
    setIsOpen(true);
    onModalChange?.(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
    setFormState("idle");
    setErrorMsg("");
    onModalChange?.(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      setErrorMsg("All fields are required.");
      setFormState("error");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMsg("Please enter a valid email address.");
      setFormState("error");
      return;
    }
    if (message.length > 2000) {
      setErrorMsg("Message must be 2000 characters or fewer.");
      setFormState("error");
      return;
    }

    setFormState("submitting");
    setErrorMsg("");

    try {
      const res = await fetch("https://admin.tranmer.ca/api/helpdesk/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Form-Token": process.env.NEXT_PUBLIC_HELPDESK_TOKEN ?? "",
        },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), subject: subject.trim(), message: message.trim() }),
      });

      if (res.ok) {
        setFormState("success");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMsg((data as { error?: string }).error ?? "Something went wrong. Please try again.");
        setFormState("error");
      }
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setFormState("error");
    }
  };

  const inputClass =
    "w-full px-4 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors text-sm";

  return (
    <>
      {/* Contact App Icon */}
      <div
        className="group flex flex-col items-center gap-2 cursor-pointer"
        onClick={openModal}
        role="button"
        tabIndex={0}
        aria-label={`Open ${label} contact form`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openModal();
          }
        }}
      >
        <div
          className={`w-20 h-20 sm:w-24 sm:h-24 md:w-[77px] md:h-[77px] lg:w-[77px] lg:h-[77px] rounded-2xl shadow-lg shadow-black/20 dark:shadow-black/40 grid place-items-center text-3xl sm:text-4xl lg:text-3xl text-white ${gradient} transition-transform group-active:scale-95 border border-white/20`}
        >
          <span aria-hidden className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{emoji}</span>
        </div>
        <span className="text-xs sm:text-sm font-medium text-white dark:text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
          {label}
        </span>
      </div>

      {/* Contact Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={closeModal}
        >
          <div
            className="bg-gray-900/80 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full border border-white/15 shadow-2xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div className={`w-14 h-14 rounded-2xl ${gradient} grid place-items-center text-2xl text-white mb-3 mx-auto shadow-lg border border-white/20`}>
                <span>{emoji}</span>
              </div>
              <h2 className="text-xl font-bold text-white">Get in Touch</h2>
              <p className="text-xs text-white/50 mt-1">Send a message — I'll get back to you soon.</p>
            </div>

            {/* Form or success state */}
            {formState === "success" ? (
              <div className="text-center py-6">
                <div className="text-4xl mb-3">✅</div>
                <p className="text-white font-semibold text-lg">Message sent!</p>
                <p className="text-white/60 text-sm mt-1">I'll get back to you as soon as I can.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate className="space-y-3 mb-5">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    className={inputClass}
                    disabled={formState === "submitting"}
                    required
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className={inputClass}
                    disabled={formState === "submitting"}
                    required
                  />
                </div>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Subject"
                  className={inputClass}
                  disabled={formState === "submitting"}
                  required
                />
                <div className="relative">
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Your message…"
                    rows={3}
                    maxLength={2000}
                    className={`${inputClass} resize-none`}
                    disabled={formState === "submitting"}
                    required
                  />
                  <span className={`absolute bottom-2 right-3 text-xs ${message.length > 1900 ? "text-amber-300" : "text-white/30"}`}>
                    {message.length}/2000
                  </span>
                </div>

                {formState === "error" && errorMsg && (
                  <p className="text-red-300 text-sm text-center">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={formState === "submitting"}
                  className="w-full py-3 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 rounded-xl text-white font-medium transition-colors border border-blue-400/50 disabled:border-white/10"
                >
                  {formState === "submitting" ? "Sending…" : "Send Message"}
                </button>
              </form>
            )}

            {/* Contact links */}
            <div className="border-t border-white/10 pt-4 space-y-2.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-sm">📧</span>
                </div>
                <a href="mailto:help@tranmer.ca" className="text-white/80 text-sm font-medium hover:text-blue-300 transition-colors">
                  help@tranmer.ca
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-sm">💼</span>
                </div>
                <a href="https://www.linkedin.com/in/tom-tranmer-11a7b819/" target="_blank" rel="noopener noreferrer" className="text-white/80 text-sm font-medium hover:text-green-300 transition-colors">
                  linkedin.com/in/tomtranmer
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-500/30 rounded-xl flex items-center justify-center shrink-0">
                  <span className="text-sm">💻</span>
                </div>
                <a href="https://github.com/tomtranmer" target="_blank" rel="noopener noreferrer" className="text-white/80 text-sm font-medium hover:text-gray-300 transition-colors">
                  github.com/tomtranmer
                </a>
              </div>
            </div>

            {/* Close button */}
            <div className="text-center mt-5">
              <button
                onClick={closeModal}
                className="px-8 py-2.5 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-all duration-200 border border-white/20 hover:border-white/40 hover:scale-105 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
