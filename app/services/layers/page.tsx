import type { Metadata } from "next";
import { ServicesShell } from "@/components/services/ServicesShell";
import { LayeredStack } from "@/components/services/LayeredStack";

export const metadata: Metadata = {
  title: "Plans | Tranmer Web Services",
  description: "Infrastructure, support and build time from Tranmer Web Services.",
  robots: { index: false },
};

export default function Page() {
  return (
    <ServicesShell current="/services/layers">
      <LayeredStack />
    </ServicesShell>
  );
}
