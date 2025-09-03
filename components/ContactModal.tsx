"use client";

import { useState } from "react";

export type ContactModalProps = {
  label: string;
  emoji: string;
  gradient: string;
  onModalChange?: (isOpen: boolean) => void;
};

export function ContactModal({ label, emoji, gradient, onModalChange }: ContactModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    onModalChange?.(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEmail("");
    setIsSubmitting(false);
    onModalChange?.(false);
  };

  const handleEmailRequest = async () => {
    if (!email.trim()) return;
    
    setIsSubmitting(true);
    
    // Create mailto link with pre-filled subject and body
    const subject = encodeURIComponent("Contact Request from Portfolio");
    const body = encodeURIComponent(`Hi Tom,

I visited your portfolio website and would like to get in touch.

My email: ${email}

Looking forward to hearing from you!

Best regards`);
    
    const mailtoLink = `mailto:tom@tranmer.ca?subject=${subject}&body=${body}`;
    
    // Open the user's email client
    window.open(mailtoLink);
    
    // Reset form after a brief delay
    setTimeout(() => {
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      {/* Contact App Icon */}
      <div
        className="group flex flex-col items-center gap-2 cursor-pointer"
        onClick={openModal}
        role="button"
        tabIndex={0}
        aria-label={`Open ${label} contact information`}
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl p-8 max-w-md w-full border border-white/20 dark:border-white/10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className={`w-16 h-16 rounded-2xl ${gradient} grid place-items-center text-2xl text-white mb-4 mx-auto shadow-lg border border-white/20`}>
                <span>{emoji}</span>
              </div>
              <h2 className="text-2xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                Contact Information
              </h2>
            </div>

            {/* Contact Details */}
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-blue-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-lg">📧</span>
                </div>
                <div>
                  <p className="text-sm text-white/60">Email</p>
                  <a 
                    href="mailto:help@tranmer.ca" 
                    className="text-white font-medium hover:text-blue-300 transition-colors"
                  >
                    help@tranmer.ca
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-green-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-lg">💼</span>
                </div>
                <div>
                  <p className="text-sm text-white/60">LinkedIn</p>
                  <a 
                    href="https://www.linkedin.com/in/tom-tranmer-11a7b819/" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-green-300 transition-colors"
                  >
                    linkedin.com/in/tomtranmer
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-gray-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-lg">💻</span>
                </div>
                <div>
                  <p className="text-sm text-white/60">GitHub</p>
                  <a 
                    href="https://github.com/tomtranmer" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-gray-300 transition-colors"
                  >
                    github.com/tomtranmer
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-500/30 rounded-xl flex items-center justify-center">
                  <span className="text-lg">🌐</span>
                </div>
                <div>
                  <p className="text-sm text-white/60">Self-serve Hosting</p>
                  <a 
                    href="https://tranmerwebservices.ca" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium hover:text-purple-300 transition-colors"
                  >
                    tranmerwebservices.ca
                  </a>
                </div>
              </div>
            </div>

            {/* Email Request Section */}
            <div className="border-t border-white/10 pt-6 mt-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Get in Touch</h3>
                <p className="text-sm text-white/70">Enter your email to request more information</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Your Email"
                  className="w-full sm:flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400/50 transition-colors text-center sm:text-left"
                  disabled={isSubmitting}
                />
                <button
                  onClick={handleEmailRequest}
                  disabled={!email.trim() || isSubmitting}
                  className="w-full sm:w-auto px-6 py-3 bg-blue-500/80 hover:bg-blue-500 disabled:bg-white/10 disabled:text-white/30 rounded-xl text-white font-medium transition-colors border border-blue-400/50 disabled:border-white/10 whitespace-nowrap"
                >
                  {isSubmitting ? "Sending..." : "Request Mail"}
                </button>
              </div>
            </div>

            {/* Close Button */}
            <div className="text-center">
              <button
                onClick={closeModal}
                className="px-8 py-3 bg-white/20 hover:bg-white/30 rounded-full text-white font-medium transition-colors border border-white/20"
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
