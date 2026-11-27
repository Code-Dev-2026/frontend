'use client';

import { useEffect, useRef, useState } from 'react';
import type {
  Map as MapLibreMap,
  Marker,
  StyleSpecification,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  createTerraDrawMapLibreAdapter,
  type RouteDrawAdapter,
} from '../../../../src/features/routes/draw-adapter';
import type {
  DrawToolMode,
  RouteStopItem,
} from '../../../../src/features/routes/route-designer';

interface RouteDesignerMapProps {
  stops: ReadonlyArray<RouteStopItem>;
  selectedStopId: string | null;
  invalidStopId: string | null;
  toolMode: DrawToolMode;
  readOnly: boolean;
  publishedSummaryText: string;
  onSelectToolMode: (mode: DrawToolMode) => void;
  onSelectStop: (stopId: string) => void;
  onAddStopAtCoords: (coords: { latitude: number; longitude: number }) => void;
}

const FALLBACK_STYLE: StyleSpecification = {
  version: 8,
  sources: {},
  layers: [
    {
      id: 'cs-designer-bg',
      type: 'background',
      paint: {
        'background-color': '#f8fafc',
      },
    },
  ],
};

function createStopMarkerElement(
  stop: RouteStopItem,
  isSelected: boolean,
  isInvalid: boolean,
  isPublished: boolean,
  onClick: () => void,
): HTMLButtonElement {
  const button = document.createElement('button');
  button.type = 'button';
  button.setAttribute('aria-label', `#${stop.order} ${stop.name}`);
  button.className =
    'flex flex-col items-center gap-1 bg-transparent p-0 focus:outline-none';

  const circle = document.createElement('span');
  if (stop.isSchoolDestination) {
    circle.className =
      'flex h-11 w-11 items-center justify-center rounded-full border-2 border-dashed border-[#023866] bg-white shadow-sm';
    const icon = document.createElement('img');
    icon.alt = '';
    icon.src = '/icons/shield-check.svg';
    icon.width = 20;
    icon.height = 20;
    circle.appendChild(icon);
  } else if (isInvalid) {
    circle.className =
      'flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#b91c1c] bg-[#fef2f2] text-[13px] font-bold text-[#b91c1c] shadow-sm';
    circle.textContent = String(stop.order);
  } else if (isPublished) {
    circle.className =
      'flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-[#047857] text-[13px] font-bold text-white shadow-sm';
    circle.textContent = String(stop.order);
  } else {
    circle.className = `flex h-9 w-9 items-center justify-center rounded-full border-2 text-[13px] font-bold shadow-sm ${
      isSelected
        ? 'border-[#1464cf] bg-[#023866] text-white ring-4 ring-[#e6f8fd]'
        : 'border-white bg-[#fca11f] text-[#0f172a]'
    }`;
    circle.textContent = String(stop.order);
  }

  const label = document.createElement('span');
  label.className = `max-w-[200px] truncate rounded-md border px-2 py-0.5 text-[11px] font-medium shadow-sm ${
    isInvalid
      ? 'border-[#fca5a5] bg-[#fef2f2] text-[#b91c1c]'
      : 'border-[#e2e8f0] bg-white text-[#334155]'
  }`;
  label.textContent = `#${stop.order} ${stop.name} · ${stop.scheduledTime}`;

  button.appendChild(circle);
  button.appendChild(label);
  button.addEventListener('click', (event) => {
    event.stopPropagation();
    onClick();
  });
  return button;
}

export function RouteDesignerMap({
  stops,
  selectedStopId,
  invalidStopId,
  toolMode,
  readOnly,
  publishedSummaryText,
  onSelectToolMode,
  onSelectStop,
  onAddStopAtCoords,
}: RouteDesignerMapProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const adapterRef = useRef<RouteDrawAdapter | null>(null);
  const markersRef = useRef<Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  const onSelectStopRef = useRef(onSelectStop);
  onSelectStopRef.current = onSelectStop;

  const onAddStopRef = useRef(onAddStopAtCoords);
  onAddStopRef.current = onAddStopAtCoords;

  const toolModeRef = useRef(toolMode);
  toolModeRef.current = toolMode;

  const readOnlyRef = useRef(readOnly);
  readOnlyRef.current = readOnly;

  const stopsRef = useRef(stops);
  stopsRef.current = stops;

  useEffect(() => {
    let active = true;
    const container = containerRef.current;
    if (!container) return undefined;

    async function initMap() {
      try {
        const maplibregl = await import('maplibre-gl');
        if (!active || !container) return;

        const map = new maplibregl.Map({
          container,
          style: FALLBACK_STYLE,
          center: [-75.6915, 4.8122],
          zoom: 13.8,
          attributionControl: false,
        });

        mapRef.current = map;

        map.on('load', () => {
          if (!active) return;
          const adapter = createTerraDrawMapLibreAdapter(map, (coords) => {
            if (!readOnlyRef.current && toolModeRef.current === 'add_stop') {
              onAddStopRef.current(coords);
            }
          });
          adapter.start();
          adapter.setToolMode(toolModeRef.current);
          adapterRef.current = adapter;

          if (!map.getSource('designer-route')) {
            map.addSource('designer-route', {
              type: 'geojson',
              data: {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'LineString',
                  coordinates: stopsRef.current.map((s) => [
                    s.longitude,
                    s.latitude,
                  ]),
                },
              },
            });
            map.addLayer({
              id: 'designer-route-line',
              type: 'line',
              source: 'designer-route',
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
              paint: {
                'line-color': '#1877f2',
                'line-width': 4,
              },
            });
          }

          setMapReady(true);
        });
      } catch {
        if (active) setMapReady(false);
      }
    }

    void initMap();

    return () => {
      active = false;
      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];
      adapterRef.current?.stop();
      adapterRef.current = null;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    adapterRef.current?.setToolMode(readOnly ? 'select' : toolMode);
  }, [toolMode, readOnly]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapReady) return;

    const source = map.getSource('designer-route') as
      { setData: (data: GeoJSON.Feature) => void } | undefined;
    if (source) {
      source.setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: stops.map((s) => [s.longitude, s.latitude]),
        },
      });
    }

    if (map.getLayer('designer-route-line')) {
      const lineColor = invalidStopId
        ? '#dc2626'
        : readOnly
          ? '#047857'
          : '#1877f2';
      map.setPaintProperty('designer-route-line', 'line-color', lineColor);
    }

    let cancelled = false;
    async function syncMarkers() {
      const maplibregl = await import('maplibre-gl');
      if (cancelled || !mapRef.current) return;

      for (const marker of markersRef.current) {
        marker.remove();
      }
      markersRef.current = [];

      for (const stop of stops) {
        const el = createStopMarkerElement(
          stop,
          stop.id === selectedStopId,
          stop.id === invalidStopId,
          readOnly,
          () => onSelectStopRef.current(stop.id),
        );
        const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
          .setLngLat([stop.longitude, stop.latitude])
          .addTo(mapRef.current);
        markersRef.current.push(marker);
      }
    }

    void syncMarkers();

    return () => {
      cancelled = true;
    };
  }, [stops, selectedStopId, invalidStopId, readOnly, mapReady]);

  const tools: ReadonlyArray<{ id: DrawToolMode; label: string }> = [
    { id: 'select', label: 'Seleccionar' },
    { id: 'add_stop', label: 'Agregar parada' },
    { id: 'reorder', label: 'Reordenar' },
    { id: 'delete', label: 'Eliminar' },
  ];

  return (
    <div className="relative flex min-h-[540px] flex-1 flex-col overflow-hidden bg-slate-50">
      {/* Cuadrícula vial de respaldo */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(203, 213, 225, 0.35) 1px, transparent 1px), linear-gradient(to bottom, rgba(203, 213, 225, 0.35) 1px, transparent 1px)',
          backgroundSize: '84px 84px',
        }}
      />

      <div
        className="relative z-10 h-full min-h-[540px] w-full flex-1"
        ref={containerRef}
      />

      {/* Barra superior del mapa */}
      <div className="pointer-events-none absolute inset-x-4 top-4 z-20 flex flex-wrap items-center justify-between gap-2">
        {readOnly ? (
          <span className="pointer-events-auto inline-flex items-center rounded-full border border-cs-borderSoft bg-white/95 px-3 py-1.5 text-[12px] font-medium text-cs-textBody shadow-sm">
            Solo lectura · Sin herramientas de dibujo
          </span>
        ) : (
          <div
            aria-label="Herramientas de edición de mapa"
            className="pointer-events-auto flex flex-wrap items-center gap-1 rounded-[12px] border border-cs-borderSoft bg-white/95 p-1.5 shadow-sm"
            role="toolbar"
          >
            {tools.map((tool) => {
              const active = toolMode === tool.id;
              return (
                <button
                  aria-pressed={active}
                  className={`rounded-[8px] px-3 py-1.5 text-[13px] font-medium transition-colors ${
                    active
                      ? 'bg-cs-primary text-white'
                      : 'text-cs-textBody hover:bg-cs-surfaceInput'
                  }`}
                  key={tool.id}
                  onClick={() => onSelectToolMode(tool.id)}
                  type="button"
                >
                  {tool.label}
                </button>
              );
            })}
          </div>
        )}

        <span
          className={`pointer-events-auto inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium shadow-sm ${
            readOnly
              ? 'border border-cs-successBorder bg-cs-successBg text-cs-successText'
              : 'border border-cs-borderSoft bg-white/95 text-cs-textMuted'
          }`}
        >
          {readOnly ? publishedSummaryText : 'Trazado calculado al guardar'}
        </span>
      </div>

      {/* Ayuda discreta al usar modo Agregar parada */}
      {!readOnly && toolMode === 'add_stop' && (
        <div className="pointer-events-none absolute bottom-4 left-4 z-20 rounded-full border border-cs-cyan bg-cs-infoBg px-3 py-1 text-[12px] font-medium text-cs-navy shadow-sm">
          Haz clic en el mapa para ubicar una nueva parada
        </div>
      )}
    </div>
  );
}
