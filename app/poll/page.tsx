"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

type SurveyResponses = {
  satisfaction: string;
  features: string[];
  appFeatures: string[];
  appStory: string;
  bookingEase: string;
  email: string;
};

function PollForm() {
  const searchParams = useSearchParams();
  const [responses, setResponses] = useState<SurveyResponses>({
    satisfaction: "",
    features: [],
    appFeatures: [],
    appStory: "",
    bookingEase: "",
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setResponses((prev) => ({
        ...prev,
        [name]: checked
          ? [...(prev[name as keyof SurveyResponses] as string[]), value]
          : (prev[name as keyof SurveyResponses] as string[]).filter((f) => f !== value),
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
      const response = await fetch('/api/submit-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(responses),
      });

      if (response.ok) {
        setSubmitMessage('Thank you for your feedback! Your survey has been submitted successfully.');
        // Reset form after success
        setResponses({
          satisfaction: "",
          features: [],
          appFeatures: [],
          appStory: "",
          bookingEase: "",
          email: "",
        });
      } else {
        setSubmitError('Failed to submit survey. Please try again.');
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
        <h1 className="text-4xl font-bold">Appstravaganza Onboarding</h1>
        <p className="mt-4 text-lg">Help us pre-seed our build week.</p>
      </header>

      <main className="max-w-2xl mx-auto px-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          

          <div>
            <label className="block text-lg font-medium mb-4">
              What features does your app require? (auth, payments, data storage, etc.) - select all that apply
            </label>
            <div className="space-y-2">
              {["Authentication (login/signup)", "Payments/Stripe integration", "Data storage (database)", "File uploads", "Real-time features (chat, notifications)", "Admin dashboard", "API integrations", "Other"].map((feature) => (
                <label key={feature} className="flex items-center">
                  <input
                    type="checkbox"
                    name="appFeatures"
                    value={feature}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {feature}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-4" htmlFor="appStory">
              Tell us your app story...
            </label>
            <textarea
              id="appStory"
              name="appStory"
              value={responses.appStory}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-zinc-400"
              rows={4}
              placeholder="Describe your app idea, goals, target users, etc."
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-4">
              How easy was your week booking (1-5)?
            </label>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((rating) => (
                <label key={rating} className="flex items-center">
                  <input
                    type="radio"
                    name="bookingEase"
                    value={rating.toString()}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {rating}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-4">
              How satisfied are you with our services? (optional)
            </label>
            <div className="flex space-x-4">
              {["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"].map((option) => (
                <label key={option} className="flex items-center">
                  <input
                    type="radio"
                    name="satisfaction"
                    value={option}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-4" htmlFor="email">
              Email (for follow-up, use booking email)
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={responses.email}
              onChange={handleChange}
              className="w-full p-3 bg-white/10 rounded-lg text-white placeholder-zinc-400"
              placeholder="yourbooking@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Survey'}
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
        </form>
      </main>

      <footer className="py-12 text-center">
        <p>&copy; 2025 Tranmer Web Services. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default function PollPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center">Loading...</div>}>
      <PollForm />
    </Suspense>
  );
}