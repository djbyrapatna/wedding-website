import { Coffee, Croissant, Utensils, Wine, Moon, Compass, IceCream, type LucideIcon } from "lucide-react";

type Place = { name: string; query: string };
type Section = {
  title: string;
  icon: LucideIcon;
  iconColor: "sage" | "gold";
  places: Place[];
};

export const SECTIONS: Section[] = [
  {
    title: "Coffee",
    icon: Coffee,
    iconColor: "sage",
    places: [
      { name: "Summer Moon Coffee", query: "Summer Moon Coffee Austin TX" },
      { name: "Jo's Coffee on 2nd", query: "Jo's Coffee 2nd Street Austin TX" },
      { name: "Sorrento's Coffee", query: "Sorrento's Coffee Austin TX" },
      { name: "Desnudo Coffee", query: "Desnudo Coffee Austin TX" },
    ],
  },
  {
    title: "Breakfast",
    icon: Croissant,
    iconColor: "gold",
    places: [
      { name: "Rosen's Bagels", query: "Rosen's Bagels Austin TX" },
      { name: "Phoebe's", query: "Phoebe's Diner Austin TX" },
    ],
  },
  {
    title: "Lunch & Dinner",
    icon: Utensils,
    iconColor: "sage",
    places: [
      { name: "Cabo Bob's", query: "Cabo Bob's Austin TX" },
      { name: "Jewboy Burgers", query: "Jewboy Burgers Austin TX" },
      { name: "One Taco", query: "One Taco Austin TX" },
      { name: "Terry Black's BBQ", query: "Terry Black's Barbecue Austin TX" },
      { name: "Banger's", query: "Banger's Sausage House Austin TX" },
    ],
  },
  {
    title: "Sweets",
    icon: IceCream,
    iconColor: "gold",
    places: [
      { name: "Jeni's Splendid Ice Creams", query: "Jeni's Splendid Ice Creams Austin TX" },
      { name: "Amy's Ice Creams", query: "Amy's Ice Creams Austin TX" },
    ],
  },
  {
    title: "Drinks",
    icon: Wine,
    iconColor: "gold",
    places: [
      { name: "Upstairs at Caroline's", query: "Upstairs at Caroline's Austin TX" },
      { name: "The Roosevelt Room", query: "The Roosevelt Room Austin TX" },
      { name: "Arriba Abajo", query: "Arriba Abajo Austin TX downtown" },
      { name: "Cockfight", query: "Cockfight ATX Austin TX" },
      { name: "Zanzibar", query: "Zanzibar Austin TX" },
    ],
  },
  {
    title: "Late Night",
    icon: Moon,
    iconColor: "sage",
    places: [
      { name: "P. Terry's", query: "P. Terry's Burger Stand Austin TX" },
    ],
  },
  {
    title: "Outdoors",
    icon: Compass,
    iconColor: "gold",
    places: [
      { name: "Barton Springs Pool", query: "Barton Springs Pool Austin TX" },
      { name: "Congress Ave Bat Bridge", query: "Congress Avenue Bat Bridge Austin TX" },
      { name: "Rowing Dock (paddleboarding)", query: "Rowing Dock Austin TX" },
    ],
  },
];

