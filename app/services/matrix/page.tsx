import type { Metadata } from "next";
import { ServicesShell } from "@/components/services/ServicesShell";
import { OfferingMatrix } from "@/components/services/OfferingMatrix";

export const metadata: Metadata = {
  title: "Plans | Tranmer Web Services",
  description: "Infrastructure, support and build time from Tranmer Web Services.",
  robots: { index: false },
};

export default function Page() {
  return (
    <ServicesShell current="/services/matrix">
      <OfferingMatrix />
    </ServicesShell>
  );
}
