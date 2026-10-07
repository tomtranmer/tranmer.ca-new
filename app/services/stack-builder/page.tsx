import type { Metadata } from "next";
import { ServicesShell } from "@/components/services/ServicesShell";
import { StackBuilder } from "@/components/services/StackBuilder";

export const metadata: Metadata = {
  title: "Plans | Tranmer Web Services",
  description: "Infrastructure, support and build time from Tranmer Web Services.",
  robots: { index: false },
};

export default function Page() {
  return (
    <ServicesShell current="/services/stack-builder">
      <StackBuilder />
    </ServicesShell>
  );
}
