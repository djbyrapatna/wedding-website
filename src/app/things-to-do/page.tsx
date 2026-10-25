import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import ThingsToDoContent from "./ThingsToDoContent";

export const metadata: Metadata = pageMetadata('Things to Do', 'Our favorite spots in our wedding city — coffee, eats, drinks, and outdoor activities for guests making a weekend of it.');

export default function ThingsToDoPage() {
  return <ThingsToDoContent />;
}
