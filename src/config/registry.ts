import { Gift, Sofa, Palmtree, type LucideIcon } from "lucide-react";

type Registry = {
  name: string;
  description?: string;
  icon: LucideIcon;
  url: string | null;
  color: "sage" | "gold";
  comingSoon?: boolean;
  /** Internal link (same site) — uses client-side routing, no new tab. */
  internal?: boolean;
};

export const REGISTRIES: Registry[] = [
  {
    name: "Crate & Barrel",
    description: "Home and kitchen.",
    icon: Sofa,
    url: "https://www.crateandbarrel.com/gift-registry/lyndsey-sager-and-andrew-hicks/r7546104",
    color: "gold",
  },
  {
    name: "Amazon",
    description: "Everyday essentials.",
    icon: Gift,
    url: "https://www.amazon.com/wedding/guest-view/3EIOIRQPQLMQI",
    color: "sage",
  },
  {
    name: "Honeymoon Fund",
    description: "Help send us off on our honeymoon.",
    icon: Palmtree,
    url: "/registry/honeymoon",
    color: "sage",
    internal: true,
  },
];

