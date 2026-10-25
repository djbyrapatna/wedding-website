import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import RsvpContent from "./RsvpContent";
import RsvpClosed from "./RsvpClosed";
import { getRsvpOpen } from "@/lib/settings";

export const metadata: Metadata = pageMetadata('RSVP', 'RSVP to the couple wedding celebration.');

// Read fresh on every request so the admin's open/close toggle takes effect
// immediately (no static caching of the RSVP page).
export const dynamic = "force-dynamic";

// The RSVP form is shown while RSVPs are open. Once the admin closes them
// (site_settings.rsvp_open = false), guests see the closed page instead. The
// API route enforces the same gate server-side, so this is purely the UI.
export default async function RsvpPage() {
  const open = await getRsvpOpen();
  return open ? <RsvpContent /> : <RsvpClosed />;
}
