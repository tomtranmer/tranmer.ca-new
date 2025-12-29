"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type PreBookingResponses = {
  lockInInterest: string;
  currentHostingPlan: string;
  yearsInterested: string;
  estimatedMonthlyCost: string;
  additionalServices: string[];
  comments: string;
  email: string;
};

export type LockInModalProps = {
  emoji: string;
  gradient: string;
  onModalChange?: (isOpen: boolean) => void;
};

function PreBookingForm({ onClose, scrollRef }: { onClose: () => void; scrollRef: React.RefObject<HTMLDivElement | null> }) {
  const searchParams = useSearchParams();
  const [responses, setResponses] = useState<PreBookingResponses>({
    lockInInterest: "",
    currentHostingPlan: "",
    yearsInterested: "",
    estimatedMonthlyCost: "",
    additionalServices: [],
    comments: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Autopopulate email from URL query param
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam && !responses.email) {
      setResponses((prev) => ({ ...prev, email: emailParam }));
    }
  }, [searchParams, responses.email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setResponses((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name as keyof PreBookingResponses] as string[]), value]
          : (prev[name as keyof PreBookingResponses] as string[]).filter((f) => f !== value),
      }));
    } else {
      setResponses((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);
    setSubmitError(null);

    try {
      const response = await fetch('/api/submit-hosting-prebooking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responses),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for your interest! We will be in touch shortly with your personalized hosting pre-payment options.');
        // Reset form after success
        setResponses({
          lockInInterest: "",
          currentHostingPlan: "",
          yearsInterested: "",
          estimatedMonthlyCost: "",
          additionalServices: [],
          comments: "",
          email: "",
        });
      } else {
        setSubmitError('Failed to submit form. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubmitError('An error occurred while submitting. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto min-h-0">
      {/* <div className="mb-6 p-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Why Lock In Your Rates?</h3>
        <p className="text-sm mb-2">
          Do you want cost certainty from your hosting bill for the next 5 years?</p>
        <p className="text-sm mb-2">
          Due to rising inflation, the costs for many of our business essentials have been on the rise. This may have also created a profitability gap for your business.
        </p>
        <p className="text-sm">
          <strong>We are here to help!</strong> Fill out the form below and we will send you a multi-year invoice to LOCK IN your rates for Hosting, Domain Management and internal Email Services<sup>*</sup>.
        </p>
      </div> */}

      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-4">
        <div>
          <label className="block text-sm sm:text-sm font-medium mb-2" htmlFor="currentHostingPlan">
            What is your current hosting plan with TWS?
          </label>
          <select
            id="currentHostingPlan"
            name="currentHostingPlan"
            value={responses.currentHostingPlan}
            onChange={handleChange}
            className="w-full p-3 sm:p-2 bg-white/10 rounded-lg text-white placeholder-zinc-400 text-sm touch-manipulation"
            required
          >
            <option value="" className="bg-gray-900">Select your plan</option>
            <option value="Basic Hosting" className="bg-gray-900">Basic Hosting</option>
            <option value="Pro Hosting" className="bg-gray-900">Pro Hosting</option>
            <option value="Enterprise Hosting" className="bg-gray-900">Enterprise Hosting</option>
            <option value="Custom/Multiple Sites" className="bg-gray-900">Custom/Multiple Sites</option>
            <option value="Not Currently a Client" className="bg-gray-900">Not Currently a Client</option>
          </select>
        </div>

        <div>
          <label className="block text-sm sm:text-sm font-medium mb-2" htmlFor="email">
            Email (for follow-up)
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={responses.email}
            onChange={handleChange}
            className="w-full p-3 sm:p-2 bg-white/10 rounded-lg text-white placeholder-zinc-400 text-sm touch-manipulation"
            placeholder="your@email.com"
            required
          />
        </div>

        <div>
          <label className="block text-sm sm:text-sm font-medium mb-2">
            How many years would you like to lock in your rate?
          </label>
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-2">
            {["1 year", "2 years", "3 years", "4 years", "5 years"].map((option) => (
              <label key={option} className="flex items-center justify-center p-2 sm:p-1 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer touch-manipulation transition-colors">
                <input
                  type="radio"
                  name="yearsInterested"
                  value={option}
                  checked={responses.yearsInterested === option}
                  onChange={handleChange}
                  className="mr-2 w-4 h-4 sm:w-3 sm:h-3"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* <div>
          <label className="block text-sm font-medium mb-2" htmlFor="estimatedMonthlyCost">
            What is your estimated current monthly hosting cost? (optional)
          </label>
          <input
            type="text"
            id="estimatedMonthlyCost"
            name="estimatedMonthlyCost"
            value={responses.estimatedMonthlyCost}
            onChange={handleChange}
            className="w-full p-2 bg-white/10 rounded-lg text-white placeholder-zinc-400 text-sm"
            placeholder="e.g., $50/month or I'm not sure"
          />
        </div> */}

        <div>
          <label className="block text-sm sm:text-sm font-medium mb-3">
            What additional services do you have with us or are you interested in adding? (select all that apply)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
            {[
              "Website maintenance assurance (hack protection)",
              "SEO report audit and optimization",
              "Performance optimization",
              "Email hosting",
              "Domain management",
              "App development",
            ].map((service) => {
              const isSelected = responses.additionalServices.includes(service);
              return (
                <button
                  key={service}
                  type="button"
                  onClick={() => {
                    const newServices = isSelected
                      ? responses.additionalServices.filter((s) => s !== service)
                      : [...responses.additionalServices, service];
                    setResponses((prev) => ({ ...prev, additionalServices: newServices }));
                  }}
                  className={`p-4 sm:p-3 rounded-lg text-sm sm:text-xs font-medium transition-colors text-left touch-manipulation ${
                    isSelected
                      ? 'bg-blue-600/80 text-white border-2 border-blue-400'
                      : 'bg-white/10 text-white/80 border-2 border-white/20 hover:bg-white/20 active:bg-white/30'
                  }`}
                >
                  {service}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm sm:text-sm font-medium mb-2" htmlFor="comments">
            Additional comments or questions
          </label>
          <textarea
            id="comments"
            name="comments"
            value={responses.comments}
            onChange={handleChange}
            className="w-full p-3 sm:p-2 bg-white/10 rounded-lg text-white placeholder-zinc-400 text-sm touch-manipulation"
            rows={3}
            placeholder="Let us know if you have any specific needs or questions..."
          />
        </div>

        

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 sm:py-2 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-base sm:text-sm touch-manipulation"
          >
            {isSubmitting ? 'Submitting...' : 'Register Your Interest'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 rounded-lg text-white font-medium transition-colors border border-white/20 text-base sm:text-sm touch-manipulation"
          >
            Cancel
          </button>
        </div>

        {submitMessage && (
          <div className="mt-3 p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg text-sm">
            {submitMessage}
          </div>
        )}

        {submitError && (
          <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        <p className="text-xs text-white/60 mt-2 pb-4"><sup>*</sup> Rates are locked in for Hosting, Domain Management, and internal Email Services only. Additional 3rd party services and software may be subject to separate annual agreements and pricing...</p>
      </form>
    </div>
  );
}

export function LockInModal({ emoji, gradient, onModalChange }: LockInModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrolledToTop, setIsScrolledToTop] = useState(true);
  const [canScroll, setCanScroll] = useState(false);

  const openModal = () => {
    setIsOpen(true);
    onModalChange?.(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    onModalChange?.(false);
  };

  // Handle scroll position tracking
  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (!scrollElement) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = scrollElement;
      setIsScrolledToTop(scrollTop === 0);
      setCanScroll(scrollHeight > clientHeight);
    };

    // Check initial scroll state
    handleScroll();

    scrollElement.addEventListener('scroll', handleScroll);
    return () => scrollElement.removeEventListener('scroll', handleScroll);
  }, [isOpen]);

  const scrollToTop = () => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToBottom = () => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  };

  return (
    <>
      {/* Lock In Button */}
      <div className="flex justify-center">
        <button
          onClick={openModal}
          className="px-6 py-4 sm:px-8 sm:py-4 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white font-bold text-base sm:text-lg rounded-xl shadow-lg transition-colors border-2 border-green-500 touch-manipulation"
        >
          🔒 Lock in Request Now
        </button>
      </div>

      {/* Lock In Modal */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          {/* Modal Content */}
          <div
            className="bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-3xl p-4 sm:p-6 max-w-sm sm:max-w-2xl w-full border-2 border-white/30 dark:border-white/20 max-h-[90vh] relative flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 sm:w-8 sm:h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors z-10 touch-manipulation"
              aria-label="Close modal"
            >
              <span className="text-xl sm:text-lg font-bold">×</span>
            </button>

            {/* Header */}
            <div className="text-center mb-4 sm:mb-6">
              <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl ${gradient} grid place-items-center text-xl sm:text-2xl text-white mb-3 sm:mb-4 mx-auto shadow-lg border border-white/20`}>
                <span>{emoji}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] px-2">
                Request your Lock In for 2026
              </h2>
              {/* <p className="text-sm text-white/70 mt-2">
                We all know the effects of rising inflation on our business expenses. TWS is giving the opportunity to current clients to <strong>LOCK IN</strong> at current rates for up to 5 years!
              </p> */}
            </div>

            {/* Form */}
            <Suspense fallback={<div className="text-center text-white">Loading...</div>}>
              <PreBookingForm onClose={closeModal} scrollRef={scrollRef} />
            </Suspense>

            {/* Scroll Indicator Button */}
            {canScroll && (
              <button
                onClick={isScrolledToTop ? scrollToBottom : scrollToTop}
                className="absolute bottom-4 right-4 z-10 w-12 h-12 bg-blue-600/90 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 touch-manipulation"
                aria-label={isScrolledToTop ? "Scroll to bottom" : "Scroll to top"}
              >
                <span className="text-lg">{isScrolledToTop ? "↓" : "↑"}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}