"use client";

import { useState, useEffect, Suspense } from "react";
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

function PreBookingForm() {
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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="py-12 text-center">
        <h1 className="text-4xl font-bold">It&apos;s Time to Lock In for 2026</h1>
        <p className="mt-4 text-lg max-w-3xl mx-auto px-6">
          We all know the effects of rising inflation on our business expenses. TWS is giving the opportunity to current clients to <strong>LOCK IN</strong> at current rates for up to 5 years!
        </p>
      </header>

      <main className="max-w-2xl mx-auto px-6 pb-12">
        <div className="mb-8 p-6 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Why Lock In Your Rates?</h2>
          <p className="mb-4">
            Due to rising infrastructure costs, all TWS prices are under annual review. Most of my fixed costs are priced in USD and all of my billing is done in CAD. This has also created a profitability gap as the CAD has dropped against USD over the past 5 years.
          </p>
          <p className="mb-4">
            <strong>We are here to help!</strong> If that means helping you build something new, maintain what you are currently offering to your clients or help you to take over your services to DIY in-house, that&apos;s what we are here for. TWS makes it work for you.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h2 className="block text-lg font-bold mb-4">
              Do you want cost certainty from your hosting bill for the next 5 years?
            </h2>
            <p>Fill out the form below and we will send you a multi-year invoice to LOCK IN your rates for Hosting, Domain Management and internal Email Services<sup>*</sup>.</p>
            {/* <div className="flex flex-wrap gap-4">
              {["Absolutely!", "Very Interested", "Somewhat Interested", "Not Sure Yet", "Not Interested"].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="lockInInterest"
                    value={option}
                    checked={responses.lockInInterest === option}
                    onChange={handleChange}
                    className="mr-2"
                    required
                  />
                  {option}
                </label>
              ))}
            </div> */}
          </div>

          <div>
            <label className="block text-lg font-medium mb-4" htmlFor="currentHostingPlan">
              What is your current hosting plan with TWS?
            </label>
            <select
              id="currentHostingPlan"
              name="currentHostingPlan"
              value={responses.currentHostingPlan}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-zinc-400"
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
            <label className="block text-lg font-medium mb-4">
              How many years would you like to lock in your rate?
            </label>
            <div className="flex flex-wrap gap-4">
              {["1 year", "2 years", "3 years", "4 years", "5 years"].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="yearsInterested"
                    value={option}
                    checked={responses.yearsInterested === option}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-4" htmlFor="estimatedMonthlyCost">
              What is your estimated current monthly hosting cost? (optional)
            </label>
            <input
              type="text"
              id="estimatedMonthlyCost"
              name="estimatedMonthlyCost"
              value={responses.estimatedMonthlyCost}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-zinc-400"
              placeholder="e.g., $50/month or I'm not sure"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-4">
              What additional services do you have with us or are you interested in adding? (select all that apply)
            </label>
            <div className="space-y-2">
              {[
                "Website maintenance assurance (hack protection)",
                "SEO report audit and optimization",
                "Performance optimization",
                "Email hosting",
                "Domain management",
                "App development",
              ].map((service) => (
                <label key={service} className="flex items-center">
                  <input
                    type="checkbox"
                    name="additionalServices"
                    value={service}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {service}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-4" htmlFor="comments">
              Additional comments or questions
            </label>
            <textarea
              id="comments"
              name="comments"
              value={responses.comments}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-zinc-400"
              rows={4}
              placeholder="Let us know if you have any specific needs or questions..."
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-4" htmlFor="email">
              Email (for follow-up)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={responses.email}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-zinc-400"
              placeholder="your@email.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Register Your Interest'}
          </button>

          {submitMessage && (
            <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 rounded-lg">
              {submitMessage}
            </div>
          )}

          {submitError && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 rounded-lg">
              {submitError}
            </div>
          )}

          <p><sup>*</sup> Rates are locked in for Hosting, Domain Management, and internal Email Services only. Additional 3rd party services and software may be subject to separate annual agreements and pricing...</p>
        </form>
      </main>

      <footer className="py-12 text-center">
        <p>&copy; 2025 Tranmer Web Services. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function HostingPreBookingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">Loading...</div>}>
      <PreBookingForm />
    </Suspense>
  );
}
