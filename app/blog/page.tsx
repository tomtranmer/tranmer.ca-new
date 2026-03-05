export default function BlogPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <article className="w-full max-w-2xl bg-white rounded-lg border border-gray-200 shadow-lg px-8 sm:px-12 py-12 sm:py-16">
        {/* Header */}
        <header className="mb-12 pb-8 border-b-2 border-gray-200">
          <h1 className="text-4xl sm:text-5xl font-bold mb-6 text-gray-900 leading-tight">
            Apps Are the New Spreadsheet
          </h1>
          <h3 className="text-2xl sm:text-3xl font-semibold mb-6 text-gray-700">
            How They Change the Businesses of Tracking
          </h3>
          <div className="my-8 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-6 border border-gray-200">
            <img src="/blog-hero.svg" alt="From complicated spreadsheets to modern apps" className="w-full h-auto" />
          </div>
          <div className="space-y-4 text-lg text-gray-600">
            <p>
              We have all been there: your spreadsheet has 47 tabs, formulas that broke three versions ago, and you're manually copying data between sheets at midnight. You rely on spreadsheets to keep your business running. Welcome to the club — we decided to build our way out of it.
            </p>
            <p>
              We realized something while building tools for small businesses: <strong className="text-gray-900">spreadsheets aren't the problem. Staying stuck with them is.</strong>
            </p>
            <p>
              Here are three new demo apps that we built to ditch the spreadsheet and unlock many new possibilities in the past year.
            </p>
          </div>
        </header>

        {/* Case Study 1 */}
        <section className="mb-12 pb-12 border-b border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 mt-8">
            Case Study #1: SB_Tracker – From Complicated to Real-Time Business Tracking
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Problem</h3>
          <p className="mb-4 text-gray-700">
            A freelancer was using FreshBooks for invoicing, a spreadsheet for expenses, and Stripe for payment tracking. She was reconciling across three systems every week—and the numbers never easily matched.
          </p>
          <blockquote className="my-6 px-6 py-4 bg-gray-100 border-l-4 border-green-600 italic text-gray-700">
            "This app is built on a foundation of simplicity, but can be expanded to meet the needs of any business. Tom built me a DayTracker addon so I can keep track of my time and bill clients accurately. It is a custom-built tool that grows with my business."
          </blockquote>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Solution</h3>
          <p className="mb-4 text-gray-700">
            SB_Tracker simplifies everything. Expenses and Payments are the lifeblood of every business, and reports to see what is happening in real time, in one place. Import transactions directly from Stripe or your bank and automatically keep track of credit card fees to review the year at tax time. To keep on top of things in real-time, enter your payments and expenses as they happen, and SB_Tracker will automatically categorize them and update your profit/loss dashboard. No more manual reconciliation or waiting for reports to update.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Results</h3>
          <ul className="space-y-3 mb-4 text-gray-700">
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">From 2 hours to 10 minutes:</strong> Weekly accounting now takes a quick check-in instead of a full audit</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Real-time insight:</strong> Knows your profit/loss on demand, not 3 weeks from now</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Zero errors:</strong> Automated categorization means no more "where did that $500 go?" moments</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Tax season faster:</strong> All data is clean and ready. No scrambling for receipts in February.</span>
            </li>
          </ul>
          <blockquote className="my-6 px-6 py-4 bg-gray-100 border-l-4 border-green-600 italic text-gray-700">
            "SB_Tracker is like having a mini CFO in my pocket. I can see how my business is doing at any moment, and I don't have to worry about missing something important."
          </blockquote>
        </section>

        {/* Case Study 2 */}
        <section className="mb-12 pb-12 border-b border-gray-200">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 mt-8">
            Case Study #2: MyMint – From Envelope Budgeting to Whole Home Financial Dashboard
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Problem</h3>
          <p className="mb-4 text-gray-700">
            A trader was maintaining a personal finance spreadsheet with manual bank feeds, Excel calculations for portfolio tracking, and handwritten notes on margin accounts. He'd often miss updates or calculate wrong—especially when markets moved fast.
          </p>
          <blockquote className="my-6 px-6 py-4 bg-gray-100 border-l-4 border-green-600 italic text-gray-700">
            "I'd open the spreadsheet and it would be three days out of date. I had no idea if I was actually up or down."
          </blockquote>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Solution</h3>
          <p className="mb-4 text-gray-700">
            MyMint pulled all his accounts together—checking, savings, investment accounts, crypto wallets. Live portfolio dashboard. Automated categorization. Built-in daytrader tools for tracking position changes in real-time.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Results</h3>
          <ul className="space-y-3 mb-4 text-gray-700">
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Live portfolio:</strong> See exact position value and P&L instantly (not yesterday's numbers)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Margin clarity:</strong> Automated perps tracking so he knows his leverage at a glance</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Smarter trades:</strong> Historical data and performance trends built in (no external tools needed)</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Less stress:</strong> Automatic syncs mean he never has to manually input data again</span>
            </li>
          </ul>
          <blockquote className="my-6 px-6 py-4 bg-gray-100 border-l-4 border-green-600 italic text-gray-700">
            "The app does what spreadsheets <em>pretend</em> to do—it actually keeps up with you."
          </blockquote>
        </section>

        {/* Case Study 3 */}
        <section className="mb-12 pb-12">
          <h2 className="text-3xl font-bold mb-4 text-gray-900 mt-8">
            Case Study #3: NEW Team-Up Tracker – Collaborate with your friends and keep track of your investments.
          </h2>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Problem</h3>
          <p className="mb-4 text-gray-700">
            Our small team was using a shared spreadsheet to track LP pools, perps positions, and fund transfers. Some could see the shared sheet and some needed periodic reports generated to know what was going on.
          </p>
          <blockquote className="my-6 px-6 py-4 bg-gray-100 border-l-4 border-green-600 italic text-gray-700">
            "We went from an opaque system of trust and reporting to a real-time system that can be monitored by all club members. It's a game-changer for our group."
          </blockquote>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Solution</h3>
          <p className="mb-4 text-gray-700">
            Team-Up Tracker is built for real-time collaboration. LP range displays, perps fund deposits/withdrawals, trade tracking, and fund transfer logic—all in one platform. Changes sync instantly. No conflicts. Clear audit trail.
          </p>

          <h3 className="text-xl font-semibold mt-6 mb-3 text-gray-800">The Results</h3>
          <ul className="space-y-3 mb-4 text-gray-700">
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">True real-time:</strong> Everyone sees updates instantly; no merge conflicts or stale data</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Clear ownership:</strong> Built-in tracking shows who did what and when</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Faster decisions:</strong> No time wasted figuring out what's current; everyone's on the same page</span>
            </li>
            <li className="flex gap-3">
              <span className="text-green-600 font-bold flex-shrink-0">✓</span>
              <span><strong className="text-gray-900">Scalable:</strong> Handles complexity (multi-pool positions, leverage tracking) that breaks spreadsheets</span>
            </li>
          </ul>
          <blockquote className="my-6 px-6 py-4 bg-gray-100 border-l-4 border-green-600 italic text-gray-700">
            "We went from 'is this data fresh?' to 'what's the actual trade?' Huge difference."
          </blockquote>
        </section>

        {/* Pattern Section */}
        <section className="mb-12 px-8 py-10 bg-gray-100 rounded-lg">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">The Pattern</h2>
          <p className="mb-4 text-gray-700">
            These stories aren't unique. They're the same pattern we see over and over:
          </p>
          <p className="text-lg text-gray-700">
            <strong className="text-gray-900">Spreadsheets solve one problem (simple storage) and create three more (manual updates, version conflicts, no automation).</strong>
          </p>
          <p className="mt-4 text-gray-700">
            Apps solve all of them at once.
          </p>
        </section>

        {/* CTA Section */}
        <section className="mb-12 px-8 py-12 bg-gradient-to-r from-purple-600 to-purple-800 rounded-lg text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Make the Jump?</h2>
          <p className="mb-6 text-lg">
            If you're still wrestling with spreadsheets, here's the good news: <strong>building an app for your workflow doesn't take as long as you think.</strong>
          </p>
          <p className="mb-8 text-white/95">
            Start small. Pick one pain point. Build an app that solves it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <a
              href="https://sb-tracker.tranmer.ca"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Try SB_Tracker
            </a>
            <a
              href="https://mymint.tranmer.ca"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Try MyMint
            </a>
            <a
              href="https://teamup.tranmer.ca"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors"
            >
              Try Team-Up Tracker
            </a>
          </div>

          <p className="text-sm text-white/90 mb-4">
            Or if you have a different workflow stuck in a spreadsheet,{' '}
            <a href="mailto:contact@tranmer.ca" className="underline hover:text-white">
              reach out
            </a>
            . We might just build it next.
          </p>
          <p className="text-xl">
            <strong>The future isn't spreadsheets. The future is your time back.</strong>
          </p>
        </section>

        {/* Footer CTA */}
        <section className="px-8 py-10 bg-gray-100 rounded-lg text-center">
          <p className="mb-6 text-gray-700">
            Have a spreadsheet horror story? Share it with us—or try one of our apps and tell us how much time you save.
          </p>
          <a
            href="https://sb-tracker.tranmer.ca"
            className="inline-block px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Get Started Free →
          </a>
        </section>
      </article>
    </main>
  );
}
