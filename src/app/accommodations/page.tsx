import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import AccommodationsContent from "./AccommodationsContent";

export const metadata: Metadata = pageMetadata('Accommodations', 'Hotels, travel tips, and things to do in our wedding city for the couple wedding.');

export default function AccommodationsPage() {
  return <AccommodationsContent />;
}
