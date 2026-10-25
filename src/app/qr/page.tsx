import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import QrContent from "./QrContent";

export const metadata: Metadata = pageMetadata('QR Code', 'Printable QR code for wedding invitations.');

export default function QrPage() {
  return <QrContent />;
}
