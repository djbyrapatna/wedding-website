import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import WeddingPartyContent from "./WeddingPartyContent";

export const metadata: Metadata = pageMetadata('Wedding Party', 'Meet the bridesmaids, groomsmen, and special members of the couple wedding party.');

export default function WeddingPartyPage() {
  return <WeddingPartyContent />;
}
