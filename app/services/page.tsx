import { redirect } from "next/navigation";

// Draft landing for the web.tranmer.ca refresh. Points at the current
// front-runner until a design is chosen.
export default function ServicesPage() {
  redirect("/services/stack-builder");
}
