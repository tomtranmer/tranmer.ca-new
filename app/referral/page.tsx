"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, AlertCircle, HelpCircle } from "lucide-react";
import { ReferralForm } from "@/components/ReferralForm";
import { PartnerSpotlight } from "@/components/PartnerSpotlight";
import { trackReferralSubmission, trackReferralError } from "@/lib/analytics";

export default function ReferralPage() {
  const [submissionState, setSubmissionState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successEmail, setSuccessEmail] = useState("");

  const handleFormSubmit = async (referredEmail: string, referrerEmail?: string) => {
    setSubmissionState("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/submit-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referredEmail, referrerEmail }),
      });

      if (!response.ok) {
        const error = await response.json();
        const errorMsg = error.message || "Failed to send referral email";
        trackReferralError(errorMsg);
        throw new Error(errorMsg);
      }

      setSuccessEmail(referredEmail);
      setSubmissionState("success");
      
      // Track successful referral submission
      trackReferralSubmission(referredEmail, !!referrerEmail);
      
      setTimeout(() => {
        setSubmissionState("idle");
        setSuccessEmail("");
      }, 5000);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An error occurred";
      setErrorMessage(errorMsg);
      setSubmissionState("error");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            ← Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Limited Time Offer Notice */}
        <div className="mb-8 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 border-2 border-amber-300 dark:border-amber-700 rounded-lg p-4 sm:p-6">
          <p className="text-center text-amber-900 dark:text-amber-100 font-semibold text-lg">
            ⏰ <strong>Limited Time Offer</strong>
          </p>
          <p className="text-center text-amber-800 dark:text-amber-200 mt-2">
            Act now, this offer will be available to current hosting clients for 6 weeks — through <strong>March 23, 2026</strong>
          </p>
        </div>

        {/* Hero Section */}
        <section className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white mb-6">
            Refer a Hosting Migration
          </h1>
          <div className="max-w-2xl mx-auto mb-8">
            <p className="text-lg text-slate-700 dark:text-slate-200 mb-6 leading-relaxed">
              TWS is here to support small business. Our north star is helping those businesses that need limited IT and support services for their website and app properties, but don't have the time to DIY or money to hire more staff. This promotion will save current clients money and connect new clients with a service that can help them also save money.
            </p>
            <p className="text-xl font-semibold text-blue-600 dark:text-blue-400">
              Earn $100 in hosting credit for each new client you refer ($500 max/year)
            </p>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-12 text-center">
            How It Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Enter Email", desc: "Add your friend's email address" },
              { step: "2", title: "We Send", desc: "Introduction email from our team" },
              { step: "3", title: "They Migrate", desc: "Your friend migrates to TWS" },
              { step: "4", title: "You Earn", desc: "$100 credit on your account" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-blue-600 dark:bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400">{item.desc}</p>
              </div>
            ))}
          </div>
          <br/><br/>
          <p className="text-center">In order to ensure you get credit for the referral, enter your TWS billing address in the second field in the form below.</p>
        </section>

        {/* Main CTA Form Section */}
        <section className="mb-16 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-8 sm:p-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 text-center">
            Get Started
          </h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-8">
            Enter your friend's email and we'll send them an introduction.
          </p>

          <ReferralForm
            onSubmit={handleFormSubmit}
            isLoading={submissionState === "loading"}
          />

          {/* Success Message */}
          {submissionState === "success" && (
            <div className="mt-8 p-6 bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg flex gap-4">
              <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Success!
                </h3>
                <p className="text-green-800 dark:text-green-300 text-sm">
                  Introduction email sent to {successEmail}. We're tracking this
                  referral and you'll get your $100 credit once the migration is
                  complete.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {submissionState === "error" && (
            <div className="mt-8 p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg flex gap-4">
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Error
                </h3>
                <p className="text-red-800 dark:text-red-300 text-sm">
                  {errorMessage}
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Benefits Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Why Refer?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Help Your Friends",
                desc: "Get them expert support with a seamless hosting migration",
              },
              {
                title: "Unlimited Referrals",
                desc: "there's an annual max - earn up to $500 credit per year",
              },
              {
                title: "Build Community",
                desc: "Be part of a growing network of happy TWS customers",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 bg-blue-50 dark:bg-slate-800 rounded-lg border border-blue-200 dark:border-slate-700"
              >
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  {item.title}
                </h3>
                <p className="text-slate-700 dark:text-slate-300">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bradshaw Design Partner Spotlight */}
        <section className="mb-16">
          <PartnerSpotlight
            icon="🎨"
            name="Bradshaw Design"
            subtitle="Premium Web Design & Branding"
            description="Neil Bradshaw is one of TWS's first partners offering premium design and branding services to complement your hosting. You have seen his work everywhere! Contact Neil today to get expert advice."
            ctaText="Visit Bradshaw Design"
            ctaUrl="https://bradshawdesign.ca"
            badge="Featured Partner"
            bgImg="https://bradshawdesign.ca/wp-content/themes/bradshawdesign/images/bg-slides/eedda2eb.slide-1.jpg"
            colorScheme={{
              light: "bg-gradient-to-br from-purple-50 to-indigo-50",
              dark: "dark:bg-gradient-to-br dark:from-purple-950 dark:to-indigo-950",
              border: "border-purple-200",
              darkBorder: "dark:border-purple-800",
              accent: "text-purple-600",
              darkAccent: "dark:text-purple-400",
            }}
          />
        </section>

        <section className="mb-16">
          <PartnerSpotlight
            icon="📊"
            name="SB Tracker"
            subtitle="Business Financial Tracking & Analytics"
            description="SB Tracker helps you monitor your business finances in real-time. Check your 2025 taxes in 10 minutes. Get insights into your spending, revenue, and profitability to make smarter business decisions. Track every dollar and optimize your bottom line."
            ctaText="Visit SB Tracker"
            ctaUrl="https://sb-tracker.tranmer.ca"
            badge="Featured Partner"
            bgImg="/backgrounds/sb_tracker.jpg"
            colorScheme={{
              light: "bg-gradient-to-br from-blue-50 to-cyan-50",
              dark: "dark:bg-gradient-to-br dark:from-blue-950 dark:to-cyan-950",
              border: "border-blue-200",
              darkBorder: "dark:border-blue-800",
              accent: "text-blue-600",
              darkAccent: "dark:text-blue-400",
            }}
          />
        </section>

        <section className="mb-16">
          <PartnerSpotlight
            icon="🥩"
            name="Great Canadian Meat"
            subtitle="Premium Quality Meats & Butchery"
            description="Great Canadian Meat is your trusted source for premium quality meats and butchery services. From fresh cuts to specialty items, they provide the finest meats for your family and business. Experience quality, freshness, and exceptional service."
            ctaText="Visit Great Canadian Meat"
            ctaUrl="https://greatcanadianmeat.com"
            badge="Featured Partner"
            bgImg="https://greatcanadianmeat.com/wp-content/uploads/2020/10/new-home-9.jpg"
            colorScheme={{
              light: "bg-gradient-to-br from-red-50 to-orange-50",
              dark: "dark:bg-gradient-to-br dark:from-red-950 dark:to-orange-950",
              border: "border-red-200",
              darkBorder: "dark:border-red-800",
              accent: "text-red-600",
              darkAccent: "dark:text-red-400",
            }}
          />
        </section>

        {/* Featured Partner CTA */}
        <div className="text-center mb-16">
          <a
            href="mailto:help@tranmer.ca?subject=TWS%20Partner%20Showcase&body=Hi%21%20I%27d%20like%20to%20be%20featured%20as%20a%20partner%20on%20a%20future%20TWS%20promotion%20or%20page.%20Here%20are%20the%20details%3A%0A%0A-%20Partner%2FCompany%20Name%3A%0A-%20Brief%20Description%20%28one%20sentence%29%3A%0A-%20Website%20URL%3A%0A-%20Icon%2FLogo%20%28emoji%20or%20URL%29%3A%0A-%20Call-to-Action%20Button%20Text%3A%0A-%20Background%20Image%20URL%20%28optional%29%3A%0A-%20Subtitle%20%28optional%29%3A%0A-%20Badge%2FLabel%20%28optional%29%3A%0A%0AThank%20you%21"
            className="inline-flex items-center justify-center px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors duration-200"
          >
            💼 Want to be a featured partner? Reach out here
          </a>
        </div>

        {/* FAQ Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8 text-center">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: "How do you track referrals?",
                a: "We track each introduction email we send. When your referred friend completes their first bill payment with us, we'll add the $100 credit to your account.",
              },
              {
                q: "When do I get my $100 credit?",
                a: "Your $100 account credit is awarded after your referred customer's first bill is paid. We handle this manually to ensure accuracy.",
              },
              {
                q: "Can I refer someone who's already using TWS?",
                a: "No, we only offer credits for new customer migrations. If the email is already associated with an active account, we'll let you know.",
              },
              {
                q: "What counts as a successful migration?",
                a: "A successful migration is when your referred customer completes their first billing cycle with us. That's when your $100 credit is activated.",
              },
              {
                q: "Is there a limit to how many people I can refer?",
                a: "You can refer unlimited friends, but the referral credits are capped at $500 per calendar year. Each successful migration earns you $100 credit until you reach the yearly maximum.",
              },
              {
                q: "Who should I contact with questions?",
                a: "You can reply to the introduction email or reach out to our team at help@tranmer.ca",
              },
            ].map((item, idx) => (
              <details
                key={idx}
                className="group cursor-pointer bg-slate-50 dark:bg-slate-800 p-6 rounded-lg border border-slate-200 dark:border-slate-700"
              >
                <summary className="flex items-start justify-between font-semibold text-slate-900 dark:text-white">
                  <span className="flex items-center gap-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    {item.q}
                  </span>
                  <span className="text-slate-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <p className="mt-4 text-slate-700 dark:text-slate-300">{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-lg p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">Have Questions?</h2>
          <p className="text-lg mb-8 text-blue-100">
            Our team is here to help. Reach out anytime.
          </p>
          <a
            href="mailto:help@tranmer.ca"
            className="inline-block bg-white text-blue-600 font-semibold px-8 py-3 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Contact Us
          </a>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-slate-600 dark:text-slate-400 text-sm">
            TWS Referral Program • February 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
