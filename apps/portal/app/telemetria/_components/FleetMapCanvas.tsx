'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  PROVISIONAL_ROUTE_POLYLINE,
  PROVISIONAL_ROUTE_STOPS,
  type ProvisionalFleetVehicle,
} from '../telemetry-state';

interface FleetMapCanvasProps {
  vehicles: ReadonlyArray<ProvisionalFleetVehicle>;
  selectedVehicleId: string | null;
  onSelectVehicle: (vehicleId: string) => void;
  focusSequence: number;
  useFallbackCanvas: boolean;
  onMapLoadError: () => void;
}

const FALLBACK_OFFLINE_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'cs-background',
      type: 'background',
      paint: {
        'background-color': '#f8fafc',
      },
    },
  ],
};

function createMarkerElement(
  label: string,
  variant:
    | 'bus-default'
    | 'bus-focus'
    | 'bus-error'
    | 'stop'
    | 'child-stop'
    | 'geofence',
  onClick?: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', label);
  button.className = `flex w-20 flex-col items-center gap-1 bg-transparent p-0 focus:outline-none ${
    variant === 'bus-focus'
      ? 'rounded-[12px] border-2 border-[#1464cf] bg-white/75 p-1'
      : ''
  }`;

  const outer = document.createElement('span');
  outer.className = 'flex h-16 w-16 items-center justify-center rounded-full';

  if (
    variant === 'bus-default' ||
    variant === 'bus-focus' ||
    variant === 'bus-error'
  ) {
    outer.className += ' border-4 border-[#0abae2] bg-[#e6f8fd]';
    const inner = document.createElement('span');
    inner.className =
      'flex h-12 w-12 items-center justify-center rounded-full bg-[#023866] shadow-sm';
    const img = document.createElement('img');
    img.alt = '';
    img.width = 24;
    img.height = 24;
    img.src =
      variant === 'bus-error'
        ? '/icons/triangle-alert-white.svg'
        : '/icons/bus-front-white.svg';
    inner.appendChild(img);
    outer.appendChild(inner);
  } else if (variant === 'stop') {
    const dot = document.createElement('span');
    dot.className = 'h-6 w-6 rounded-full bg-[#fca11f] ring-2 ring-white';
    outer.appendChild(dot);
  } else if (variant === 'child-stop') {
    const inner = document.createElement('span');
    inner.className =
      'flex h-12 w-12 items-center justify-center rounded-full border-4 border-[#023866] bg-[#fca11f]';
    const img = document.createElement('img');
    img.alt = '';
    img.width = 24;
    img.height = 24;
    img.src = '/icons/map-pin.svg';
    inner.appendChild(img);
    outer.appendChild(inner);
  } else {
    const inner = document.createElement('span');
    inner.className =
      'flex h-12 w-12 items-center justify-center rounded-full border-2 border-dashed border-[#023866] bg-[#e6f8fd]';
    const img = document.createElement('img');
    img.alt = '';
    img.width = 24;
    img.height = 24;
    img.src = '/icons/shield-check.svg';
    inner.appendChild(img);
    outer.appendChild(inner);
  }

  const caption = document.createElement('span');
  caption.className = `rounded px-1 text-center text-[13px] leading-[18px] ${
    variant === 'bus-error'
      ? 'font-medium text-[#b91c1c]'
      : 'font-normal text-[#334155]'
  }`;
  caption.textContent = label;

  button.appendChild(outer);
  button.appendChild(caption);

  if (onClick) {
    button.addEventListener('click', onClick);
  }

  return button;
}

export function FleetMapCanvas({
  vehicles,
  selectedVehicleId,
  onSelectVehicle,
  focusSequence,
  useFallbackCanvas,
  onMapLoadError,
}: FleetMapCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const onSelectRef = useRef(onSelectVehicle);
  onSelectRef.current = onSelectVehicle;

  const onErrorRef = useRef(onMapLoadError);
  onErrorRef.current = onMapLoadError;

  useEffect(() => {
    let disposed = false;
    let mapInstance: MapLibreMap | null = null;

    async function initMap() {
      const container = containerRef.current;
      if (!container) return;

      try {
        const maplibregl = await import('maplibre-gl');
        if (disposed) return;

        const configuredStyle =
          process.env.NEXT_PUBLIC_MAPLIBRE_STYLE_URL ||
          'https://demotiles.maplibre.org/style.json';

        const map = new maplibregl.Map({
          container,
          style: useFallbackCanvas ? FALLBACK_OFFLINE_STYLE : configuredStyle,
          center: [-75.6945, 4.8128],
          zoom: 14.3,
          attributionControl: false,
        });

        mapInstance = map;
        mapRef.current = map;

        map.on('load', () => {
          if (disposed) return;
          if (!map.getSource('provisional-route')) {
            map.addSource('provisional-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: PROVISIONAL_ROUTE_POLYLINE.map(([lng, lat]) => [
                    lng,
                    lat,
                  ]),
                },
              },
            });
            map.addLayer({
              id: 'provisional-route-line',
              type: 'line',
              source: 'provisional-route',
              paint: {
                'line-color': '#0abae2',
                'line-width': 4,
              },
            });
          }
          setMapReady(true);
        });

        map.on('error', () => {
          if (!useFallbackCanvas && !disposed) {
            onErrorRef.current();
          }
        });
      } catch {
        if (!disposed) {
          onErrorRef.current();
        }
      }
    }

    setMapReady(false);
    void initMap();

    return () => {
      disposed = true;
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];
      if (mapInstance) {
        mapInstance.remove();
      }
      mapRef.current = null;
    };
  }, [useFallbackCanvas]);

  useEffect(() => {
    let active = true;

    async function syncMarkers() {
      const map = mapRef.current;
      if (!map || !mapReady) return;

      const maplibregl = await import('maplibre-gl');
      if (!active) return;

      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];

      for (const stop of PROVISIONAL_ROUTE_STOPS) {
        const el = createMarkerElement(stop.label, stop.kind);
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      }

      for (const vehicle of vehicles) {
        const variant =
          vehicle.status === 'Detenido'
            ? 'bus-error'
            : vehicle.id === selectedVehicleId
              ? 'bus-focus'
              : 'bus-default';
        const el = createMarkerElement(vehicle.code, variant, () =>
          onSelectRef.current(vehicle.id),
        );
        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([vehicle.longitude, vehicle.latitude])
          .addTo(map);
        markersRef.current.push(marker);
      }
    }

    void syncMarkers();

    return () => {
      active = false;
    };
  }, [vehicles, selectedVehicleId, mapReady]);

  useEffect(() => {
    if (focusSequence === 0) return;
    const map = mapRef.current;
    const target = vehicles.find((v) => v.id === selectedVehicleId);
    if (!map || !target) return;

    map.flyTo({
      center: [target.longitude, target.latitude],
      zoom: 15.1,
      duration: 600,
    });
  }, [focusSequence, selectedVehicleId, vehicles]);

  return (
    <div className="relative h-full min-h-[420px] w-full bg-cs-surfaceInput">
      {/* Fondo cartográfico base PROVISIONAL cuando se activa modo simulador sin estilo remoto */}
      {useFallbackCanvas && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden bg-cs-surfaceInput"
        >
          <div className="absolute right-0 top-0 h-[72%] w-24 bg-[#dbeafe]/60" />
          <div className="absolute left-0 right-0 top-[18%] h-3 bg-cs-borderSoft/80" />
          <div className="absolute left-0 right-0 top-[38%] h-3 bg-cs-borderSoft/80" />
          <div className="absolute left-0 right-0 top-[58%] h-3 bg-cs-borderSoft/80" />
          <div className="absolute left-0 right-0 top-[78%] h-3 bg-cs-borderSoft/80" />
          <div className="absolute bottom-0 left-[14%] top-0 w-3 bg-cs-borderSoft/80" />
          <div className="absolute bottom-0 left-[38%] top-0 w-3 bg-cs-borderSoft/80" />
          <div className="absolute bottom-0 left-[68%] top-0 w-3 bg-cs-borderSoft/80" />
        </div>
      )}

      <div
        aria-label="Mapa global de flota con MapLibre GL"
        className="h-full min-h-[420px] w-full"
        ref={containerRef}
      />
    </div>
  );
}
