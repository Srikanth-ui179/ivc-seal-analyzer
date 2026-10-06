"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { SiteMapPoint } from "@/lib/db/types";
import "leaflet/dist/leaflet.css";

type Props = { sites: SiteMapPoint[] };
type Coordinates = { latitude: number; longitude: number };

function getCoordinates(site: SiteMapPoint): Coordinates | null {
  const latitude = Number(site.latitude);
  const longitude = Number(site.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}

function formatCoordinates({ latitude, longitude }: Coordinates) {
  return `${Math.abs(latitude).toFixed(4)}°${latitude >= 0 ? "N" : "S"}, ${Math.abs(longitude).toFixed(4)}°${longitude >= 0 ? "E" : "W"}`;
}

function appendTextElement(parent: HTMLElement, tagName: keyof HTMLElementTagNameMap, className: string, text: string) {
  const element = document.createElement(tagName);
  element.className = className;
  element.textContent = text;
  parent.append(element);
  return element;
}

function buildPopupContent(site: SiteMapPoint, coordinates: Coordinates) {
  const popup = document.createElement("div");
  popup.className = "p-1 text-ink";
  appendTextElement(popup, "div", "font-serif text-base font-bold text-stone-900", site.canonicalName);

  const location = [site.modernRegion, site.country].filter(Boolean).join(", ");
  if (location) appendTextElement(popup, "div", "mb-2 text-xs text-stone-600", location);

  appendTextElement(
    popup,
    "div",
    site.isCorpusSite
      ? "mb-2 inline-block rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-900"
      : "mb-2 inline-block rounded border border-stone-300 bg-stone-100 px-2 py-0.5 text-[11px] font-semibold text-stone-700",
    site.isCorpusSite
      ? `Corpus site · ${site.inscriptionsCount} inscriptions · ${site.objectsCount} objects`
      : "Reference-only site · 0 corpus inscriptions · 0 corpus objects"
  );

  const coordinateBlock = document.createElement("div");
  coordinateBlock.className = "mb-2 space-y-0.5 font-mono text-[11px] text-stone-600";
  appendTextElement(coordinateBlock, "div", "", `Coordinates: ${formatCoordinates(coordinates)}`);
  if (site.coordinatePrecisionMeters != null) appendTextElement(coordinateBlock, "div", "", `Coordinate precision: ±${site.coordinatePrecisionMeters} m`);
  popup.append(coordinateBlock);

  const datum = document.createElement("p");
  datum.className = "mb-3 border-t border-stone-200 pt-1.5 text-[10px] leading-relaxed text-stone-500";
  const label = document.createElement("strong");
  label.textContent = "Geographic datum: ";
  datum.append(label, "Site-level coordinate. It does not represent individual seal or inscription findspots.");
  popup.append(datum);

  const detailsLink = document.createElement("a");
  detailsLink.href = `/sites/${encodeURIComponent(site.id)}`;
  detailsLink.className = "inline-block text-xs font-semibold text-amber-900 underline underline-offset-2 hover:text-stone-950";
  detailsLink.textContent = "View site details and catalogue →";
  popup.append(detailsLink);
  return popup;
}

export function ArchaeologicalMap({ sites }: Props) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [selectedSite, setSelectedSite] = useState<SiteMapPoint | null>(null);
  const selectedCoordinates = selectedSite ? getCoordinates(selectedSite) : null;
  const mappedSitesCount = sites.filter((site) => getCoordinates(site) !== null).length;

  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;
    let isDisposed = false;

    import("leaflet").then((L) => {
      if (!mapContainerRef.current || mapInstanceRef.current || isDisposed) return;
      const tileUrl = process.env.NEXT_PUBLIC_MAP_TILE_URL || "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      const tileAttribution = process.env.NEXT_PUBLIC_MAP_TILE_ATTRIBUTION || '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors';
      const subdomains = process.env.NEXT_PUBLIC_MAP_TILE_SUBDOMAINS || "abc";
      const map = L.map(mapContainerRef.current, { center: [27.0, 71.0], zoom: 6, minZoom: 4, maxZoom: 16, scrollWheelZoom: true });
      mapInstanceRef.current = map;
      L.tileLayer(tileUrl, { attribution: tileAttribution, maxZoom: 19, subdomains }).addTo(map);

      const validPoints: [number, number][] = [];
      sites.forEach((site) => {
        const coordinates = getCoordinates(site);
        if (!coordinates) return;
        validPoints.push([coordinates.latitude, coordinates.longitude]);
        const markerIcon = L.divIcon({
          className: "custom-site-marker",
          html: site.isCorpusSite
            ? '<div class="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-emerald-800 text-[10px] font-bold text-white shadow-md">★</div>'
            : '<div class="h-4 w-4 rounded-full border border-white bg-amber-800 shadow-sm"></div>',
          iconSize: site.isCorpusSite ? [32, 32] : [16, 16],
          iconAnchor: site.isCorpusSite ? [16, 16] : [8, 8],
        });
        const marker = L.marker([coordinates.latitude, coordinates.longitude], {
          icon: markerIcon,
          keyboard: true,
          title: `${site.canonicalName}: ${site.isCorpusSite ? "corpus site" : "reference-only site"}`,
        }).addTo(map);
        marker.on("click", () => setSelectedSite(site));
        marker.bindPopup(buildPopupContent(site, coordinates), { maxWidth: 280, className: "editorial-popup" });
        marker.getElement()?.setAttribute("aria-label", `${site.canonicalName}: ${site.isCorpusSite ? "corpus site" : "reference-only site"}`);
      });

      if (validPoints.length > 0) map.fitBounds(L.latLngBounds(validPoints), { padding: [40, 40], maxZoom: 8 });
    });

    return () => {
      isDisposed = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [sites]);

  return (
    <div className="relative">
      <div ref={mapContainerRef} aria-label="Interactive map of archaeological site-level coordinates" className="z-0 h-[600px] w-full rounded border border-ink/15 bg-sandstone/30 shadow-inner" style={{ minHeight: "500px" }} />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-4 rounded border border-ink/10 bg-sandstone/15 p-4 text-xs">
        <div className="flex flex-wrap items-center gap-6" aria-label="Map legend">
          <div className="flex items-center gap-2"><span aria-hidden="true" className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-800 text-[9px] text-white">★</span><span className="font-semibold text-ink">Corpus site with research records</span></div>
          <div className="flex items-center gap-2"><span aria-hidden="true" className="h-3.5 w-3.5 rounded-full border border-white bg-amber-800" /><span className="text-ink/80">Reference-only site with zero corpus records</span></div>
        </div>
        <div className="text-ink/60">Showing {mappedSitesCount} of {sites.length} represented sites with valid coordinates</div>
      </div>

      {selectedSite && (
        <div className="panel mt-4 p-5" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3"><h3 className="font-display text-2xl font-bold text-ink">{selectedSite.canonicalName}</h3><span className={selectedSite.isCorpusSite ? "rounded bg-emerald-800/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-800" : "rounded bg-sandstone/40 px-2.5 py-0.5 text-xs font-semibold text-ink/70"}>{selectedSite.isCorpusSite ? "Corpus site" : "Reference-only site"}</span></div>
              <p className="mt-1 text-sm text-ink/65">{[selectedSite.modernRegion, selectedSite.country].filter(Boolean).join(", ") || "Indus Valley region"}</p>
            </div>
            <button type="button" onClick={() => setSelectedSite(null)} aria-label={`Close ${selectedSite.canonicalName} details`} className="text-xs text-ink/50 hover:text-ink">✕ Close</button>
          </div>
          <div className="mt-4 grid gap-4 border-t border-ink/10 pt-4 text-xs sm:grid-cols-3">
            <div><span className="data-label block">Coordinates</span><span className="mt-1 block font-mono font-semibold text-ink">{selectedCoordinates ? formatCoordinates(selectedCoordinates) : "Unavailable"}</span></div>
            <div><span className="data-label block">Coordinate precision</span><span className="mt-1 block font-mono text-ink">{selectedSite.coordinatePrecisionMeters != null ? `±${selectedSite.coordinatePrecisionMeters} meters` : "Unspecified"}</span></div>
            <div><span className="data-label block">Database representation</span><span className="mt-1 block font-semibold text-ink">{selectedSite.inscriptionsCount} inscriptions · {selectedSite.objectsCount} objects</span></div>
          </div>
          <p className="mt-4 border-t border-ink/10 pt-3 text-xs leading-relaxed text-ink/70">Coordinates are site-level archaeological reference coordinates and do not represent individual artefact findspots.</p>
          {selectedSite.notes && <div className="mt-4 border-t border-ink/10 pt-3"><span className="data-label block">Archaeological provenance and source note</span><p className="mt-1 text-xs leading-relaxed text-ink/70">{selectedSite.notes}</p></div>}
          <div className="mt-4 flex flex-wrap items-center gap-4">
            <Link href={`/sites/${encodeURIComponent(selectedSite.id)}`} className="inline-block rounded bg-ink px-4 py-2 text-xs font-semibold text-paper hover:bg-moss">View site page and objects →</Link>
            {selectedSite.inscriptionsCount > 0 && <Link href={`/explorer?siteId=${encodeURIComponent(selectedSite.id)}`} className="inline-block rounded border border-ink/20 px-4 py-2 text-xs font-semibold text-clay hover:border-ink hover:text-ink">Browse inscriptions in Explorer →</Link>}
          </div>
        </div>
      )}
    </div>
  );
}
