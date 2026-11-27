import type { Map as MapLibreMap } from 'maplibre-gl';
import { TerraDraw, TerraDrawPointMode, TerraDrawSelectMode } from 'terra-draw';
import { TerraDrawMapLibreGLAdapter } from 'terra-draw-maplibre-gl-adapter';
import type { DrawToolMode } from './route-designer';

/**
 * DIP: interfaz propia que aísla la UI del motor de dibujo (Terra Draw),
 * permitiendo reemplazar el adaptador sin modificar pantallas ni estado.
 */
export interface RouteDrawAdapter {
  start: () => void;
  setToolMode: (mode: DrawToolMode) => void;
  stop: () => void;
}

export function createTerraDrawMapLibreAdapter(
  map: MapLibreMap,
  onPointDrawn: (coords: { latitude: number; longitude: number }) => void,
): RouteDrawAdapter {
  const draw = new TerraDraw({
    adapter: new TerraDrawMapLibreGLAdapter({ map }),
    modes: [
      new TerraDrawPointMode(),
      new TerraDrawSelectMode({
        flags: {
          point: {
            feature: {
              draggable: true,
            },
          },
        },
      }),
    ],
  });

  draw.on('finish', (featureId) => {
    const feature = draw.getSnapshotFeature(featureId);
    if (feature && feature.geometry.type === 'Point') {
      const [lng, lat] = feature.geometry.coordinates;
      if (typeof lng === 'number' && typeof lat === 'number') {
        onPointDrawn({ latitude: lat, longitude: lng });
      }
    }
    try {
      draw.removeFeatures([featureId]);
    } catch {
      // Ignora limpieza si el mapa ya se desmontó
    }
  });

  return {
    start: () => {
      if (!draw.enabled) {
        draw.start();
      }
    },
    setToolMode: (mode: DrawToolMode) => {
      if (!draw.enabled) return;
      draw.setMode(mode === 'add_stop' ? 'point' : 'select');
    },
    stop: () => {
      try {
        if (draw.enabled) {
          draw.stop();
        }
      } catch {
        // Mapa ya destruido
      }
    },
  };
}
