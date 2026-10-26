import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import FaqContent from "./FaqContent";

export const metadata: Metadata = pageMetadata('FAQ', 'Frequently asked questions about the couple wedding day.');

export default function FaqPage() {
  return <FaqContent />;
}
