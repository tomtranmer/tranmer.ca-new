import Link from "next/link";

export default function AppstravaganzaPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <header className="py-12 text-center">
        <h1 className="text-4xl font-bold">Appstravaganza: Build Your App in 1 Week!</h1>
        <p className="mt-4 text-lg">A special offer from Tranmer Web Services in 2025</p>
      </header>

      <main className="max-w-4xl mx-auto px-6">
        <section className="mb-12">
          <h2 className="text-2xl font-semibold">What You Get</h2>
          <ul className="mt-4 space-y-4 list-disc list-inside">
            <li>1 week, 20 hours of development time</li>
            <li>3 one-hour meetings (plan, progress, polish)</li>
            <li>1 week + 1 month hosting services included</li>
            <li>Code delivered via GitHub in production-ready state</li>
            <li>Optional public deployment to your website and ongoing development discussions</li>
          </ul>
        </section>

        <p>Maybe you need a customer booking app, an internal tool for managing your team finances, a revenue collection portal to accept stablecoins alongside credit cards for invoice payment, or something else, specific to your small business and needs that only you can imagine.</p>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold">Pricing</h2>
          <p className="mt-4">Regular Price: <span className="font-bold">$2500</span></p>
          <p>Special for Existing TWS Clients: <span className="font-bold">$500deposit + $500 post-delivery</span></p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold">Demo Apps</h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <a
              href="https://canasta.tranmer.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-gradient-to-br from-green-400 to-teal-500 p-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl">🃏</span>
              <span className="text-sm font-medium">Canasta</span>
            </a>
            <a
              href="https://opm.tranmer.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-gradient-to-br from-blue-400 to-indigo-500 p-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl">🧩</span>
              <span className="text-sm font-medium">OfficePools</span>
            </a>
            <a
              href="https://sb-tracker.tranmer.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-gradient-to-br from-purple-400 to-pink-500 p-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl">📊</span>
              <span className="text-sm font-medium">SB Tracker</span>
            </a>
            <a
              href="https://mybank.tranmer.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-gradient-to-br from-yellow-400 to-orange-500 p-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl">🏦</span>
              <span className="text-sm font-medium">MyBank</span>
            </a>
            <div
              className="flex flex-col items-center gap-2 p-4 rounded-xl shadow-lg border-2 border-dashed border-white/20 bg-white/5 dark:bg-black/5 hover:scale-105 transition-transform"
              aria-hidden
            >
              <span className="text-4xl">✨</span>
              <span className="text-sm font-medium">Your App Here</span>
            </div>
            <a
              href="https://booking.tranmer.ca"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-2 bg-gradient-to-br from-red-400 to-pink-500 p-4 rounded-xl shadow-lg hover:scale-105 transition-transform"
            >
              <span className="text-4xl">📅</span>
              <span className="text-sm font-medium">Booking</span>
            </a>
            
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold">Book Your Slot</h2>
          <p className="mt-4">Ready to get started? Book your week now!</p>
          <Link href="https://booking.tranmer.ca/calendar">
            <span className="inline-block mt-4 px-6 py-3 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">Book Now</span>
          </Link>
        </section>

        <section className="mb-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 rounded-lg border border-blue-500/30">
          <h2 className="text-2xl font-semibold mb-4">Already Booked Your Slot?</h2>
          <p className="mb-4">Help us pre-seed your build week by completing our app onboarding survey.</p>
          <div className="mb-4 p-3 bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
            <p className="text-green-200 text-sm">
              <strong>Not yet booked?</strong> Fill out the survey to be entered into a raffle to win a <strong>FREE BUILD</strong> on an open week in 2025!
            </p>
          </div>
          <Link href="/poll">
            <span className="inline-block px-6 py-3 bg-green-500 text-white font-medium rounded-lg hover:bg-green-600 transition-colors">Complete Onboarding Survey</span>
          </Link>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-semibold mt-4">FAQ</h2>

          <div className="mt-4 space-y-3">
            <details className="group bg-white/5 dark:bg-black/5 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium list-none">What does the 1-week sprint include?</summary>
              <div className="mt-2 text-sm text-zinc-300">
                The sprint includes 20 hours of engineering time, three one-hour meetings (planning, progress, polish), basic hosting for 1 week plus 1 month, and delivery of production-ready code via GitHub.
              </div>
            </details>

            <details className="group bg-white/5 dark:bg-black/5 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium list-none">Do you provide hosting and deployment?</summary>
              <div className="mt-2 text-sm text-zinc-300">
                Yes — optional public deployment is available. The package includes short-term hosting; we can also set up ongoing hosting or hand the project over to your preferred provider.
              </div>
            </details>

            <details className="group bg-white/5 dark:bg-black/5 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium list-none">Does the project build need to be an app?</summary>
              <div className="mt-2 text-sm text-zinc-300">
                Not necessarily — the project build should be a web based, which could be a promotional site, a contact capture form, or another specific app for your business. If you would prefer to use the dev time for improvements to existing properties or for database engineering, this can be discussed.
              </div>
            </details>

            <details className="group bg-white/5 dark:bg-black/5 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium list-none">How does payment work?</summary>
              <div className="mt-2 text-sm text-zinc-300">
                For existing TWS clients we ask for a $500 deposit, with the remainder due after delivery. You can use the <a href="https://booking.tranmer.ca">NEW Booking App</a> to pay the deposit and schedule your sprint. We also accept bank transfers and invoiced payments — email help@tranmer.ca for invoice details.
              </div>
            </details>

            <details className="group bg-white/5 dark:bg-black/5 p-4 rounded-lg">
              <summary className="cursor-pointer font-medium list-none">What if I need changes after delivery?</summary>
              <div className="mt-2 text-sm text-zinc-300">
                Small follow-up tweaks are included in the initial hosting window; larger feature work can be scoped separately. We offer ongoing development contracts or per-hour support as needed.
              </div>
            </details>
          </div>

        </section>

        <h2 className="text-2xl font-semibold mt-4">More Questions?</h2>
        <h3 className="mt-4">Contact us at <a href="mailto:help@tranmer.ca" className="text-blue-400 hover:underline">help@tranmer.ca</a>.</h3>


      </main>

      <footer className="py-12 text-center">
        <p>&copy; 2025 Tranmer Web Services. All rights reserved. All pricing in USD to match expenses.</p>
      </footer>
    </div>
  );
}
