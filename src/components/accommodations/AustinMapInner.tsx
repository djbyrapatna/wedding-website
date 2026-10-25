"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";

const C = {
  cream: "#F8F9FA",
  sage: "#7F9DB5",
  gold: "#D4B85C",
  charcoal: "#2C2C2C",
  warmGray: "#7A7068",
};

import { PINS, HOTEL, CHURCH, AIRPORT, BOUNDS } from "@/config/locations";

function makeIcon(id: number, color: string) {
  return L.divIcon({
    className: "wedding-map-pin",
    html: `<div style="
      width: 38px; height: 38px;
      border-radius: 50%;
      background: ${color};
      border: 3.5px solid ${C.cream};
      box-shadow: 0 3px 8px rgba(0,0,0,0.28);
      color: ${C.cream};
      font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
      font-weight: 700;
      font-size: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">${id}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
  });
}

const HOTEL_POS: LatLngTuple = [HOTEL.lat, HOTEL.lng];
const CHURCH_POS: LatLngTuple = [CHURCH.lat, CHURCH.lng];
const AIRPORT_POS: LatLngTuple = [AIRPORT.lat, AIRPORT.lng];

export default function AustinMapInner() {
  return (
    <MapContainer
      bounds={BOUNDS}
      boundsOptions={{ padding: [30, 30] }}
      scrollWheelZoom={false}
      className="h-[320px] w-full sm:h-[400px] md:h-[460px]"
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
        subdomains={["a", "b", "c", "d"]}
        maxZoom={19}
      />

      {/* Subtle dashed routes between Hotel <-> Church and Hotel <-> Airport */}
      <Polyline
        positions={[HOTEL_POS, CHURCH_POS]}
        pathOptions={{ color: C.warmGray, weight: 2, opacity: 0.55, dashArray: "4 6" }}
      />
      <Polyline
        positions={[HOTEL_POS, AIRPORT_POS]}
        pathOptions={{ color: C.warmGray, weight: 2, opacity: 0.55, dashArray: "4 6" }}
      />

      {PINS.map((pin) => (
        <Marker key={pin.id} position={[pin.lat, pin.lng]} icon={makeIcon(pin.id, pin.color)}>
          <Popup>
            <div style={{ minWidth: 170 }}>
              <div
                style={{
                  fontFamily: '"Cormorant Garamond", Georgia, serif',
                  fontSize: 17,
                  fontWeight: 600,
                  color: C.charcoal,
                  lineHeight: 1.25,
                }}
              >
                {pin.name}
              </div>
              <a
                href={`https://maps.google.com/?q=${encodeURIComponent(pin.query)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  color: C.sage,
                  fontFamily: 'ui-sans-serif, system-ui, -apple-system, sans-serif',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                  textDecoration: "none",
                }}
              >
                Get Directions →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
