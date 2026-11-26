import type { Metadata } from "next";

// The page is a client component, so its metadata lives here.
export const metadata: Metadata = {
  title: "Refer a Hosting Migration | Tranmer Web Services",
  description:
    "Refer a small business moving its website hosting to Tranmer Web Services and earn $100 in hosting credit per new client, up to $500 a year.",
  alternates: { canonical: "/referral" },
};

export default function ReferralLayout({ children }: { children: React.ReactNode }) {
  return children;
}
