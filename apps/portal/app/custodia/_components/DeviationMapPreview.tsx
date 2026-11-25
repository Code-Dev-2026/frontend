'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { ConsoleAlert } from '../alerts-state';

interface DeviationMapPreviewProps {
  focusedAlert: ConsoleAlert | null;
}

const INLINE_CANVAS_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'cs-mini-bg',
      type: 'background',
      paint: { 'background-color': '#f8fafc' },
    },
  ],
};

function makeBusPin(code: string, isAlert: boolean): HTMLDivElement {
  const wrap = document.createElement('div');
  wrap.className = 'flex flex-col items-center gap-0.5';

  const ring = document.createElement('div');
  ring.className = `flex h-12 w-12 items-center justify-center rounded-full border-[3px] ${
    isAlert ? 'border-[#0abae2] bg-[#e6f8fd]' : 'border-[#0abae2] bg-[#e6f8fd]'
  }`;

  const circle = document.createElement('div');
  circle.className =
    'flex h-9 w-9 items-center justify-center rounded-full bg-[#023866]';

  const img = document.createElement('img');
  img.alt = '';
  img.width = 18;
  img.height = 18;
  img.src = isAlert
    ? '/icons/triangle-alert.svg'
    : '/icons/bus-front-white.svg';
  circle.appendChild(img);
  ring.appendChild(circle);

  const label = document.createElement('span');
  label.className = `text-[12px] font-medium ${
    isAlert ? 'text-[#b91c1c]' : 'text-[#334155]'
  }`;
  label.textContent = code;

  wrap.appendChild(ring);
  wrap.appendChild(label);
  return wrap;
}

export function DeviationMapPreview({
  focusedAlert,
}: DeviationMapPreviewProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let mapInstance: MapLibreMap | null = null;

    async function init() {
      const container = containerRef.current;
      if (!container) return;

      const maplibregl = await import('maplibre-gl');
      if (disposed) return;

      const map = new maplibregl.Map({
        container,
        style: INLINE_CANVAS_STYLE,
        center: [-75.6945, 4.8122],
        zoom: 14.2,
        attributionControl: false,
      });

      mapInstance = map;
      mapRef.current = map;

      map.on('load', () => {
        if (disposed) return;
        map.addSource('corridor-route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [-75.702, 4.8128],
                [-75.6968, 4.8128],
                [-75.689, 4.8128],
              ],
            },
          },
        });
        map.addLayer({
          id: 'corridor-route-line',
          type: 'line',
          source: 'corridor-route',
          paint: { 'line-color': '#0abae2', 'line-width': 4 },
        });

        map.addSource('deviation-segment', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [-75.6968, 4.8128],
                [-75.6914, 4.8102],
              ],
            },
          },
        });
        map.addLayer({
          id: 'deviation-segment-line',
          type: 'line',
          source: 'deviation-segment',
          paint: {
            'line-color': '#dc2626',
            'line-width': 4,
            'line-dasharray': [2, 1.5],
          },
        });

        setMapReady(true);
      });
    }

    void init();

    return () => {
      disposed = true;
      for (const m of markersRef.current) m.remove();
      markersRef.current = [];
      if (mapInstance) mapInstance.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function updateMarkers() {
      const map = mapRef.current;
      if (!map || !mapReady) return;
      const maplibregl = await import('maplibre-gl');
      if (!active) return;

      for (const m of markersRef.current) m.remove();
      markersRef.current = [];

      const normalCoords = focusedAlert?.coordinates.normal ?? [
        -75.6968, 4.8128,
      ];
      const deviatedCoords = focusedAlert?.coordinates.deviated ?? [
        -75.6914, 4.8102,
      ];

      markersRef.current.push(
        new maplibregl.Marker({ element: makeBusPin('Ruta', false) })
          .setLngLat(normalCoords)
          .addTo(map),
      );

      if (focusedAlert?.highlightOnMap || focusedAlert?.coordinates.deviated) {
        markersRef.current.push(
          new maplibregl.Marker({
            element: makeBusPin(focusedAlert.unitCode, true),
          })
            .setLngLat(deviatedCoords)
            .addTo(map),
        );
      }

      map.flyTo({
        center: deviatedCoords,
        zoom: 14.5,
        duration: 450,
      });
    }

    void updateMarkers();

    return () => {
      active = false;
    };
  }, [focusedAlert, mapReady]);

  return (
    <div className="relative h-[220px] w-full overflow-hidden bg-cs-surfaceInput">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden bg-cs-surfaceInput"
      >
        <div className="absolute left-0 right-0 top-[28%] h-2.5 bg-cs-borderSoft/80" />
        <div className="absolute left-0 right-0 top-[68%] h-2.5 bg-cs-borderSoft/80" />
        <div className="absolute bottom-0 left-[25%] top-0 w-2.5 bg-cs-borderSoft/80" />
        <div className="absolute bottom-0 left-[68%] top-0 w-2.5 bg-cs-borderSoft/80" />
      </div>
      <div
        aria-label="Mapa de resalte de desvío reportado por backend"
        className="h-full w-full"
        ref={containerRef}
      />
    </div>
  );
}
