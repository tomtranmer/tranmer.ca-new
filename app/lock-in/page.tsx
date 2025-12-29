"use client";

import { LockInModal } from "../../components/LockInModal";

export default function HostingPreBookingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white flex items-center justify-center p-6">
      <div className="max-w-4xl mx-auto text-center">
        <header className="mb-12">
          <h1 className="text-5xl font-bold mb-6">It&apos;s Time to Lock In for 2026</h1>
          <p className="text-xl max-w-3xl mx-auto mb-8">
            We all know the effects of rising inflation on our business expenses. TWS is giving the opportunity to current clients to <strong>LOCK IN</strong> at current rates for up to 5 years!
          </p>
        </header>

        <main className="mb-12">
          <div className="mb-8 p-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg max-w-2xl mx-auto">
            <h2 className="text-3xl font-semibold mb-6">Why Lock In Your Rates?</h2>
            <p className="mb-6 text-lg">
              Do you want cost certainty from your hosting bill for the next 5 years?</p>
            <p className="mb-6 text-lg">
              Due to rising inflation, the costs for many of our business essentials have been on the rise. This may have also created a profitability gap for your business, which could be exacerbated if some of your costs are denominated in USD.
            </p>
            <p className="mb-6 text-lg">
              <strong>We are here to help!</strong> If that means helping you build something new, maintain what you are currently offering to your clients or help you to take over your services to DIY in-house, that&apos;s what we are here for. TWS makes it work for you.
            </p>
          </div>

          <LockInModal
            emoji="🔒"
            gradient="bg-gradient-to-br from-red-500 to-orange-600"
          />
        </main>

        <footer className="py-8">
          <p className="text-white/60">&copy; 2025 Tranmer Web Services. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
