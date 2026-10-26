import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";

export const metadata: Metadata = pageMetadata('Admin', 'Wedding RSVP admin dashboard.');

// Never statically cache the admin shell — always serve the current build so a
// stale CDN/browser copy can't keep showing old login behavior.
export const dynamic = "force-dynamic";

export default function AdminPage() {
  return <AdminDashboard />;
}
