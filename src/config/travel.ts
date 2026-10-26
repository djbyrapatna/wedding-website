import { WEDDING } from "./wedding";
export const TRAVEL = {
  airportCode: "AUS",
  airportMapUrl:
    "https://maps.google.com/?q=Austin-Bergstrom+International+Airport",
  arrivalDate: "2026-08-14",
  departureDate: "2026-08-16",
};
export const FLIGHT_SEARCH_URL = `https://www.google.com/travel/flights?q=${encodeURIComponent(`flights to ${TRAVEL.airportCode} on ${TRAVEL.arrivalDate} through ${TRAVEL.departureDate}`)}`;
export const HOTEL_SEARCH_URL = `https://www.google.com/travel/hotels?q=${encodeURIComponent(`hotels in ${WEDDING.location} on ${TRAVEL.arrivalDate} through ${TRAVEL.departureDate}`)}`;
