let html = `
<head>
  <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f9f9f9;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
            background-color: #fff;
        }

        header {
            margin-bottom: 60px;
            padding-bottom: 40px;
            border-bottom: 2px solid #f0f0f0;
        }

        h1 {
            font-size: 2.5rem;
            line-height: 1.2;
            margin-bottom: 24px;
            color: #1a1a1a;
        }

        .intro {
            font-size: 1.1rem;
            color: #555;
            margin-bottom: 20px;
        }

        .case-study {
            margin-bottom: 60px;
            padding-bottom: 60px;
            border-bottom: 1px solid #f0f0f0;
        }

        .case-study:last-of-type {
            border-bottom: none;
        }

        h2 {
            font-size: 1.8rem;
            margin-bottom: 20px;
            color: #1a1a1a;
            margin-top: 40px;
        }

        h3 {
            font-size: 1.2rem;
            margin-top: 28px;
            margin-bottom: 12px;
            color: #2c3e50;
        }

        p {
            margin-bottom: 16px;
            font-size: 1rem;
        }

        ul {
            list-style: none;
            margin: 20px 0;
            padding-left: 0;
        }

        li {
            padding-left: 28px;
            margin-bottom: 12px;
            position: relative;
            font-size: 1rem;
        }

        li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #27ae60;
            font-weight: bold;
            font-size: 1.2rem;
        }

        .quote {
            margin: 24px 0;
            padding: 20px 24px;
            background-color: #f8f9fa;
            border-left: 4px solid #27ae60;
            font-style: italic;
            color: #555;
        }

        .pattern-section {
            background-color: #f8f9fa;
            padding: 40px;
            border-radius: 8px;
            margin: 60px 0;
        }

        .pattern-section h2 {
            margin-top: 0;
        }

        .cta-section {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 60px 40px;
            border-radius: 8px;
            text-align: center;
            margin: 60px 0;
        }

        .cta-section h2 {
            color: white;
            margin-top: 0;
        }

        .cta-section p {
            color: rgba(255, 255, 255, 0.95);
            font-size: 1.1rem;
            margin-bottom: 30px;
        }

        .cta-links {
            display: grid;
            grid-template-columns: 1fr;
            gap: 16px;
            margin-top: 30px;
        }

        @media (min-width: 640px) {
            .cta-links {
                grid-template-columns: 1fr 1fr 1fr;
            }
        }

        .cta-link {
            background-color: rgba(255, 255, 255, 0.2);
            color: white;
            padding: 16px 24px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 500;
            transition: background-color 0.3s ease;
            display: inline-block;
        }

        .cta-link:hover {
            background-color: rgba(255, 255, 255, 0.3);
        }

        .footer-cta {
            background-color: #f0f0f0;
            padding: 40px;
            border-radius: 8px;
            text-align: center;
            margin: 60px 0 40px 0;
        }

        .footer-cta p {
            margin-bottom: 24px;
            font-size: 1.1rem;
        }

        .button {
            display: inline-block;
            background-color: #27ae60;
            color: white;
            padding: 14px 32px;
            border-radius: 6px;
            text-decoration: none;
            font-weight: 600;
            transition: background-color 0.3s ease;
        }

        .button:hover {
            background-color: #229954;
        }

        .meta {
            color: #888;
            font-size: 0.95rem;
            margin-top: 16px;
        }

        strong {
            color: #1a1a1a;
            font-weight: 600;
        }

        @media (max-width: 640px) {
            h1 {
                font-size: 1.8rem;
            }

            h2 {
                font-size: 1.4rem;
            }

            .container {
                padding: 24px 16px;
            }

            .cta-section, .pattern-section {
                padding: 32px 24px;
            }
        }
    </style>
</head>
<div>
    <article class="container">
        <header>
            <h1>Apps Are the New Spreadsheet: 3 Real Stories of How They Changed</h1>
            <p class="intro">You know the feeling: your spreadsheet has 47 tabs, formulas that broke three versions ago, and you're manually copying data between sheets at midnight. Welcome to the club—we built our way out of it.</p>
            <p class="intro">We realized something while building tools for small businesses: <strong>spreadsheets aren't the problem. Staying stuck with them is.</strong></p>
            <p class="intro">Here are three real apps that ditched the spreadsheets and won back their time.</p>
        </header>

        <section class="case-study">
            <h2>Case Study #1: SB_Tracker – From FreshBooks Hell to Real-Time Accounting</h2>

            <h3>The Problem</h3>
            <p>A freelancer was using FreshBooks for invoicing, a spreadsheet for expenses, and Stripe for payment tracking. She was reconciling across three systems every week—and the numbers never matched.</p>
            <p class="quote">"I'd spend 2 hours on Monday just figuring out what actually happened to my business."</p>

            <h3>The Solution</h3>
            <p>SB_Tracker centralizes everything. Invoices, expenses, payments, and reports—all in one place. Connected directly to her bank and Stripe account. No manual entry. No reconciliation games.</p>

            <h3>The Results</h3>
            <ul>
                <li><strong>From 2 hours to 10 minutes:</strong> Weekly accounting now takes a quick check-in instead of a full audit</li>
                <li><strong>Real-time insight:</strong> She knows her profit/loss today, not 3 weeks from now</li>
                <li><strong>Zero errors:</strong> Automated categorization means no more "where did that $500 go?" moments</li>
                <li><strong>Tax season faster:</strong> All data is clean and ready. No scrambling for receipts in November</li>
            </ul>
            <p class="quote">"I got my brain back. I can actually think about growing the business instead of chasing numbers."</p>
        </section>

        <section class="case-study">
            <h2>Case Study #2: MyMint – From Envelope Budgeting to Daytrading</h2>

            <h3>The Problem</h3>
            <p>A trader was maintaining a personal finance spreadsheet with manual bank feeds, Excel calculations for portfolio tracking, and handwritten notes on margin accounts. He'd often miss updates or calculate wrong—especially when markets moved fast.</p>
            <p class="quote">"I'd open the spreadsheet and it would be three days out of date. I had no idea if I was actually up or down."</p>

            <h3>The Solution</h3>
            <p>MyMint pulled all his accounts together—checking, savings, investment accounts, crypto wallets. Live portfolio dashboard. Automated categorization. Built-in daytrader tools for tracking position changes in real-time.</p>

            <h3>The Results</h3>
            <ul>
                <li><strong>Live portfolio:</strong> See exact position value and P&L instantly (not yesterday's numbers)</li>
                <li><strong>Margin clarity:</strong> Automated perps tracking so he knows his leverage at a glance</li>
                <li><strong>Smarter trades:</strong> Historical data and performance trends built in (no external tools needed)</li>
                <li><strong>Less stress:</strong> Automatic syncs mean he never has to manually input data again</li>
            </ul>
            <p class="quote">"The app does what spreadsheets <em>pretend</em> to do—it actually keeps up with you."</p>
        </section>

        <section class="case-study">
            <h2>Case Study #3: Team-Up Tracker – From Shared Spreadsheets to Real-Time Collaboration</h2>

            <h3>The Problem</h3>
            <p>A small team was using a shared Google Sheet to track LP pools, perps positions, and fund transfers. Three people editing the same sheet meant constant merge conflicts, lost updates, and confusion about what was current.</p>
            <p class="quote">"We'd have no idea who was working on what, and half the time the sheet was locked because someone was 'using it.'"</p>

            <h3>The Solution</h3>
            <p>Team-Up Tracker is built for real-time collaboration. LP range displays, perps fund deposits/withdrawals, trade tracking, and fund transfer logic—all in one platform. Changes sync instantly. No conflicts. Clear audit trail.</p>

            <h3>The Results</h3>
            <ul>
                <li><strong>True real-time:</strong> Everyone sees updates instantly; no merge conflicts or stale data</li>
                <li><strong>Clear ownership:</strong> Built-in tracking shows who did what and when</li>
                <li><strong>Faster decisions:</strong> No time wasted figuring out what's current; everyone's on the same page</li>
                <li><strong>Scalable:</strong> Handles complexity (multi-pool positions, leverage tracking) that breaks spreadsheets</li>
            </ul>
            <p class="quote">"We went from 'is this data fresh?' to 'what's the actual trade?' Huge difference."</p>
        </section>

        <section class="pattern-section">
            <h2>The Pattern</h2>
            <p>These stories aren't unique. They're the same pattern we see over and over:</p>
            <p><strong>Spreadsheets solve one problem (simple storage) and create three more (manual updates, version conflicts, no automation).</strong></p>
            <p>Apps solve all of them at once.</p>
        </section>

        <section class="cta-section">
            <h2>Ready to Make the Jump?</h2>
            <p>If you're still wrestling with spreadsheets, here's the good news: <strong>building an app for your workflow doesn't take as long as you think.</strong></p>
            <p>Start small. Pick one pain point. Build an app that solves it.</p>
            <div class="cta-links">
                <a href="https://sb-tracker.tranmer.ca" class="cta-link">Try SB_Tracker</a>
                <a href="https://mymint.tranmer.ca" class="cta-link">Try MyMint</a>
                <a href="https://teamup.tranmer.ca" class="cta-link">Try Team-Up Tracker</a>
            </div>
            <p style="margin-top: 30px; font-size: 0.95rem;">Or if you have a different workflow stuck in a spreadsheet, <a href="mailto:contact@tranmer.ca" style="color: white; text-decoration: underline;">reach out</a>. We might just build it next.</p>
            <p style="margin-top: 20px; font-size: 1.1rem;"><strong>The future isn't spreadsheets. The future is your time back.</strong></p>
        </section>

        <section class="footer-cta">
            <p>Have a spreadsheet horror story? Share it with us—or try one of our apps and tell us how much time you save.</p>
            <a href="https://sb-tracker.tranmer.ca" class="button">Get Started Free →</a>
        </section>
    </article>
</div>`;

export default function BlogPage() {
  return (
    <main className="p-8 max-w-3xl mx-auto">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  );
}
