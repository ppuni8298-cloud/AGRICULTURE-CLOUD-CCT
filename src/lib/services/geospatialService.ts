import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { FarmGeometry, GeoJsonPolygon, BoundarySourceType } from '@/lib/supabase/types';

const STORAGE_KEY = 'agrocloud_farm_geometries';

// Realistic initial Cadastral and Boundary Polygons for Seed Farms
const SEED_GEOMETRIES: FarmGeometry[] = [
  // Farm-001 (Kolar Green Valley Farm) - Perimeter Boundary
  {
    id: 'geom-001',
    farm_id: 'farm-001',
    user_id: 'demo-farmer-001',
    name: 'Kolar Green Valley - Whole Farm Boundary',
    boundary_type: 'survey_verified',
    centroid_lat: 13.1338,
    centroid_lng: 78.1391,
    calculated_area_acres: 5.75,
    elevation_meters: 830,
    geometry_geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [78.1375, 13.1352],
          [78.1408, 13.1355],
          [78.1412, 13.1325],
          [78.1382, 13.1321],
          [78.1375, 13.1352],
        ],
      ],
    },
    created_at: '2026-08-10T09:00:00Z',
    updated_at: '2026-10-24T14:30:00Z',
  },
  // Field-101 (North Terrace Block A)
  {
    id: 'geom-101',
    farm_id: 'farm-001',
    field_id: 'field-101',
    user_id: 'demo-farmer-001',
    name: 'North Terrace Field (Block A)',
    boundary_type: 'survey_verified',
    centroid_lat: 13.1345,
    centroid_lng: 78.1392,
    calculated_area_acres: 3.5,
    elevation_meters: 832,
    geometry_geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [78.1376, 13.1351],
          [78.1406, 13.1354],
          [78.1408, 13.1338],
          [78.1378, 13.1336],
          [78.1376, 13.1351],
        ],
      ],
    },
    created_at: '2026-08-12T10:00:00Z',
    updated_at: '2026-09-15T12:00:00Z',
  },
  // Field-102 (South Slope Block B)
  {
    id: 'geom-102',
    farm_id: 'farm-001',
    field_id: 'field-102',
    user_id: 'demo-farmer-001',
    name: 'South Slope Field (Block B)',
    boundary_type: 'farmer_estimated',
    centroid_lat: 13.1328,
    centroid_lng: 78.1395,
    calculated_area_acres: 2.25,
    elevation_meters: 828,
    geometry_geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [78.1379, 13.1335],
          [78.1409, 13.1337],
          [78.1411, 13.1324],
          [78.1383, 13.1322],
          [78.1379, 13.1335],
        ],
      ],
    },
    created_at: '2026-08-12T10:00:00Z',
    updated_at: '2026-09-15T12:00:00Z',
  },
  // Farm-002 (Haveri Black Soil Plantation)
  {
    id: 'geom-002',
    farm_id: 'farm-002',
    user_id: 'demo-farmer-001',
    name: 'Haveri Black Soil - Perimeter Boundary',
    boundary_type: 'survey_verified',
    centroid_lat: 14.7963,
    centroid_lng: 75.3991,
    calculated_area_acres: 8.5,
    elevation_meters: 595,
    geometry_geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [75.3965, 14.7985],
          [75.4015, 14.7989],
          [75.4021, 14.7942],
          [75.3971, 14.7938],
          [75.3965, 14.7985],
        ],
      ],
    },
    created_at: '2026-09-01T11:00:00Z',
    updated_at: '2026-10-20T16:15:00Z',
  },
  // Field-201 (Cotton Block 1)
  {
    id: 'geom-201',
    farm_id: 'farm-002',
    field_id: 'field-201',
    user_id: 'demo-farmer-001',
    name: 'Cotton Block 1',
    boundary_type: 'survey_verified',
    centroid_lat: 14.7972,
    centroid_lng: 75.3992,
    calculated_area_acres: 5.0,
    elevation_meters: 596,
    geometry_geojson: {
      type: 'Polygon',
      coordinates: [
        [
          [75.3966, 14.7984],
          [75.4014, 14.7988],
          [75.4017, 14.7960],
          [75.3969, 14.7956],
          [75.3966, 14.7984],
        ],
      ],
    },
    created_at: '2026-09-02T10:00:00Z',
    updated_at: '2026-10-20T16:15:00Z',
  },
];

/**
 * Calculates approximate polygon surface area in Acres using the Spherical/Geodesic Shoelace algorithm
 * @param coordinates Array of [lng, lat] pairs
 */
export function calculatePolygonAreaAcres(coordinates: number[][]): number {
  if (!coordinates || coordinates.length < 3) return 0;
  
  const radius = 6378137; // Earth's mean radius in meters (WGS84)
  let area = 0;
  const len = coordinates.length;

  for (let i = 0; i < len; i++) {
    const p1 = coordinates[i];
    const p2 = coordinates[(i + 1) % len];
    
    // Convert to radians
    const lat1 = (p1[1] * Math.PI) / 180;
    const lat2 = (p2[1] * Math.PI) / 180;
    const lng1 = (p1[0] * Math.PI) / 180;
    const lng2 = (p2[0] * Math.PI) / 180;

    area += (lng2 - lng1) * (2 + Math.sin(lat1) + Math.sin(lat2));
  }

  area = Math.abs((area * radius * radius) / 2.0); // area in square meters
  const acres = area * 0.000247105; // 1 m² = 0.000247105 acres
  return parseFloat(acres.toFixed(2));
}

/**
 * Calculates the centroid of a polygon
 */
export function calculatePolygonCentroid(coordinates: number[][]): { lat: number; lng: number } {
  if (!coordinates || coordinates.length === 0) return { lat: 13.1338, lng: 78.1391 };
  
  let totalLat = 0;
  let totalLng = 0;
  const count = coordinates.length;

  for (const point of coordinates) {
    totalLng += point[0];
    totalLat += point[1];
  }

  return {
    lat: parseFloat((totalLat / count).toFixed(6)),
    lng: parseFloat((totalLng / count).toFixed(6)),
  };
}

export const geospatialService = {
  /**
   * Retrieves all geometries for a given farm
   */
  async getGeometriesByFarm(farmId: string): Promise<FarmGeometry[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const list: FarmGeometry[] = JSON.parse(stored);
          const farmGeoms = list.filter((g) => g.farm_id === farmId);
          if (farmGeoms.length > 0) return farmGeoms;
        } catch (e) {
          console.error('Error parsing stored geometries:', e);
        }
      }
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        const { data, error } = await (supabase as any)
          .from('farm_geometries')
          .select('*')
          .eq('farm_id', farmId);
        if (!error && data && data.length > 0) {
          return data as FarmGeometry[];
        }
      }
    }

    // Return filtered seed geometries
    const seeds = SEED_GEOMETRIES.filter((g) => g.farm_id === farmId);
    return seeds.length > 0 ? seeds : SEED_GEOMETRIES.slice(0, 3);
  },

  /**
   * Retrieves specific geometry by field
   */
  async getGeometryByField(fieldId: string): Promise<FarmGeometry | null> {
    const all = await this.getAllGeometries();
    return all.find((g) => g.field_id === fieldId) || null;
  },

  /**
   * Retrieves all stored geometries
   */
  async getAllGeometries(): Promise<FarmGeometry[]> {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const list: FarmGeometry[] = JSON.parse(stored);
          if (list.length > 0) return list;
        } catch (e) {
          console.error('Error parsing stored geometries:', e);
        }
      }
    }
    return SEED_GEOMETRIES;
  },

  /**
   * Saves or updates a geometry record
   */
  async saveGeometry(payload: {
    farm_id: string;
    field_id?: string | null;
    user_id?: string;
    name: string;
    boundary_type: BoundarySourceType;
    coordinates: number[][];
    elevation_meters?: number;
  }): Promise<FarmGeometry> {
    const areaAcres = calculatePolygonAreaAcres(payload.coordinates);
    const centroid = calculatePolygonCentroid(payload.coordinates);

    const newGeom: FarmGeometry = {
      id: `geom-${Date.now()}`,
      farm_id: payload.farm_id,
      field_id: payload.field_id || null,
      user_id: payload.user_id || 'demo-farmer-001',
      name: payload.name,
      boundary_type: payload.boundary_type,
      geometry_geojson: {
        type: 'Polygon',
        coordinates: [payload.coordinates],
      },
      centroid_lat: centroid.lat,
      centroid_lng: centroid.lng,
      calculated_area_acres: areaAcres,
      elevation_meters: payload.elevation_meters || 800,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const list: FarmGeometry[] = stored ? JSON.parse(stored) : [...SEED_GEOMETRIES];
      const existingIdx = list.findIndex(
        (g) => (payload.field_id && g.field_id === payload.field_id) || g.name === payload.name
      );

      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], ...newGeom, id: list[existingIdx].id };
      } else {
        list.push(newGeom);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    }

    if (isSupabaseConfigured) {
      const supabase = createClient();
      if (supabase) {
        await (supabase as any).from('farm_geometries').upsert(newGeom);
      }
    }

    return newGeom;
  },

  /**
   * Export geometries as standard RFC 7946 GeoJSON FeatureCollection
   */
  exportToGeoJson(geometries: FarmGeometry[]): string {
    const featureCollection = {
      type: 'FeatureCollection',
      features: geometries.map((g) => ({
        type: 'Feature',
        id: g.id,
        properties: {
          name: g.name,
          farm_id: g.farm_id,
          field_id: g.field_id,
          boundary_type: g.boundary_type,
          calculated_area_acres: g.calculated_area_acres,
          elevation_meters: g.elevation_meters,
          updated_at: g.updated_at,
        },
        geometry: g.geometry_geojson,
      })),
    };

    return JSON.stringify(featureCollection, null, 2);
  },

  /**
   * Validates and parses an imported GeoJSON string into coordinate polygons
   */
  parseGeoJsonImport(jsonString: string): Array<{
    name: string;
    coordinates: number[][];
    areaAcres: number;
  }> {
    try {
      const parsed = JSON.parse(jsonString);
      const results: Array<{ name: string; coordinates: number[][]; areaAcres: number }> = [];

      const features = parsed.type === 'FeatureCollection' ? parsed.features : [parsed];

      for (let i = 0; i < features.length; i++) {
        const feat = features[i];
        const geom = feat.geometry || feat;

        if (geom.type === 'Polygon' && Array.isArray(geom.coordinates) && geom.coordinates.length > 0) {
          const rawRing = geom.coordinates[0];
          // Ensure coordinates are [lng, lat]
          const validCoords = rawRing.filter(
            (pt: any) => Array.isArray(pt) && pt.length >= 2 && !isNaN(pt[0]) && !isNaN(pt[1])
          );

          if (validCoords.length >= 3) {
            const area = calculatePolygonAreaAcres(validCoords);
            results.push({
              name: feat.properties?.name || `Imported Plot Polygon ${i + 1}`,
              coordinates: validCoords,
              areaAcres: area,
            });
          }
        }
      }

      return results;
    } catch (err) {
      throw new Error('Invalid GeoJSON format. Please provide a valid RFC 7946 GeoJSON Polygon or FeatureCollection.');
    }
  },
};

