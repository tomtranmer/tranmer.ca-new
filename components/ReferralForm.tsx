"use client";

import { useState } from "react";
import { Mail, Loader } from "lucide-react";

interface ReferralFormProps {
  onSubmit: (referredEmail: string, referrerEmail?: string) => Promise<void>;
  isLoading: boolean;
}

export function ReferralForm({ onSubmit, isLoading }: ReferralFormProps) {
  const [referredEmail, setReferredEmail] = useState("");
  const [referrerEmail, setReferrerEmail] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isReferredEmailValid = validateEmail(referredEmail);
  const isReferrerEmailValid = referrerEmail === "" || validateEmail(referrerEmail);
  const isFormValid = isReferredEmailValid && isReferrerEmailValid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate referred email
    if (!referredEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    if (!isReferredEmailValid) {
      setError("Please enter a valid email address");
      return;
    }

    // Validate referrer email if provided
    if (referrerEmail.trim() && !isReferrerEmailValid) {
      setError("Please enter a valid referrer email address");
      return;
    }

    await onSubmit(referredEmail, referrerEmail || undefined);
    setReferredEmail(""); // Clear form on success
    setReferrerEmail("");
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="space-y-4">
        {/* Referred Email Field */}
        <div>
          <label htmlFor="referred-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Friend's Email Address *
          </label>
          <div className="relative">
            <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-600 pointer-events-none" />
            <input
              id="referred-email"
              type="email"
              value={referredEmail}
              onChange={(e) => {
                setReferredEmail(e.target.value);
                setError("");
              }}
              placeholder="friend@example.com"
              disabled={isLoading}
              className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              required
            />
            {isReferredEmailValid && (
              <div className="absolute right-4 top-3.5 text-green-600 dark:text-green-400 text-lg">✓</div>
            )}
          </div>
        </div>

        {/* Referrer Email Field (conditional) */}
        {isReferredEmailValid && (
          <div className="animate-in fade-in duration-300">
            <label htmlFor="referrer-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Your Email Address (Optional)
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-500 mb-2">
              We'll CC you on the introduction email so you can see what we send
            </p>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 w-5 h-5 text-slate-400 dark:text-slate-600 pointer-events-none" />
              <input
                id="referrer-email"
                type="email"
                value={referrerEmail}
                onChange={(e) => {
                  setReferrerEmail(e.target.value);
                  setError("");
                }}
                placeholder="your@email.com"
                disabled={isLoading}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              />
              {referrerEmail && isReferrerEmailValid && (
                <div className="absolute right-4 top-3.5 text-green-600 dark:text-green-400 text-lg">✓</div>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormValid || isLoading}
          className="w-full px-6 py-3 bg-blue-600 dark:bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2 mt-6"
        >
          {isLoading ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              Sending...
            </>
          ) : (
            "Send Intro Email"
          )}
        </button>
      </div>

      {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}
