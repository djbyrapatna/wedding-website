import { pageMetadata } from "@/config/metadata";
import type { Metadata } from "next";
import StoryHero from "@/components/story/StoryHero";
import HorizontalTimelineGallery from "@/components/story/HorizontalTimelineGallery";
import NextChapter from "@/components/story/NextChapter";

export const metadata: Metadata = pageMetadata('Our Story', 'The story of how the couple met, fell in love, and decided to spend their lives together.');

export default function OurStoryPage() {
  return (
    <>
      <StoryHero />
      <HorizontalTimelineGallery />
      <NextChapter />
    </>
  );
}
