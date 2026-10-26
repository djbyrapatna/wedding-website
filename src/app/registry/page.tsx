import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import RegistryContent from "./RegistryContent";

export const metadata: Metadata = pageMetadata('Registry', 'Gift registry and honeymoon fund for the couple.');

export default function RegistryPage() {
  return <RegistryContent />;
}
