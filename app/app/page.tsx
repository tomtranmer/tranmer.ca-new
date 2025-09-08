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

        <section className="mb-12">
          <h2 className="text-2xl font-semibold">Pricing</h2>
          <p className="mt-4">Regular Price: <span className="font-bold">$2500</span></p>
          <p>Special for Existing TWS Clients: <span className="font-bold">$500 deposit + $500 post-delivery</span></p>
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

        <section>
          <h2 className="text-2xl font-semibold">FAQ</h2>
          <p className="mt-4">Have questions? Contact us at <a href="mailto:help@tranmer.ca" className="text-blue-400 hover:underline">help@tranmer.ca</a>.</p>
        </section>
      </main>

      <footer className="py-12 text-center">
        <p>&copy; 2025 Tranmer Web Services. All rights reserved.</p>
      </footer>
    </div>
  );
}
