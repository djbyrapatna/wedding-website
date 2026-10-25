import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import ThankYouContent from "./ThankYouContent";

export const metadata: Metadata = pageMetadata('Thank You', 'Thank you for your honeymoon gift.');

export default function HoneymoonThankYouPage() {
  return <ThankYouContent />;
}
