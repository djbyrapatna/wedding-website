import type { LatLngBoundsExpression } from "leaflet";
const C = { sage: "#7F9DB5", gold: "#D4B85C", charcoal: "#2C2C2C" };

type Pin = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  color: string;
  query: string;
};

export const PINS: Pin[] = [
  {
    id: 1,
    name: "Austin-Bergstrom Airport (AUS)",
    lat: 30.1945,
    lng: -97.6699,
    color: C.sage,
    query: "Austin-Bergstrom International Airport",
  },
  {
    id: 2,
    name: "St. John Neumann Catholic Church",
    lat: 30.2855,
    lng: -97.8267,
    color: C.gold,
    query: "St John Neumann Catholic Church Austin TX",
  },
  {
    id: 3,
    name: "Hotel Ella",
    lat: 30.2904,
    lng: -97.7426,
    color: C.charcoal,
    query: "Hotel Ella Austin TX",
  },
];

export const HOTEL = PINS[2];
export const CHURCH = PINS[1];
export const AIRPORT = PINS[0];

export const BOUNDS: LatLngBoundsExpression = [
  [30.18, -97.85],
  [30.30, -97.65],
];

