import { wilayas } from './wilayas-data';
import * as turf from '@turf/turf';

// Cache for GeoJSON data
let wilayaGeoJSONCache: any = null;
// Cache for generated points
let allCentersCache: Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}> | null = null;

// Function to load GeoJSON data
const loadGeoJSONData = async (): Promise<any> => {
  if (wilayaGeoJSONCache) {
    return wilayaGeoJSONCache;
  }
  
  try {
    const response = await fetch('/dz.json');
    if (!response.ok) {
      throw new Error('Failed to load GeoJSON data');
    }
    
    const data = await response.json();
    wilayaGeoJSONCache = data;
    return data;
  } catch (err) {
    console.error('Error loading GeoJSON:', err);
    return null;
  }
};

// Function to save points to localStorage
const savePointsToStorage = (points: Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}>) => {
  try {
    localStorage.setItem('mobilis-centers-cache', JSON.stringify(points));
    console.log('Points saved to localStorage');
    return true;
  } catch (err) {
    console.error('Error saving points to localStorage:', err);
    return false;
  }
};

// Function to load points from localStorage
const loadPointsFromStorage = (): Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}> | null => {
  try {
    const data = localStorage.getItem('mobilis-centers-cache');
    if (!data) return null;
    
    let points: any;
    
    try {
      points = JSON.parse(data);
    } catch (err) {
      console.error('Failed to parse cached points data:', err);
      return null;
    }
    
    // Validate parsed data is an array
    if (!Array.isArray(points)) {
      console.error('Cached points data is not an array');
      return null;
    }
    
    // Validate data structure of each point
    const validatedPoints = points.filter((point: any) => {
      // Check if point has the correct structure
      if (!point || typeof point !== 'object') return false;
      
      // Check if point has position property
      if (!point.position || !Array.isArray(point.position) || point.position.length !== 2) return false;
      
      // Check if position contains numbers
      if (typeof point.position[0] !== 'number' || typeof point.position[1] !== 'number') return false;
      
      // Check if point has wilaya property
      if (!point.wilaya || typeof point.wilaya !== 'string') return false;
      
      // Check if point has valid status property
      if (!point.status || !['normal', 'warning', 'alert'].includes(point.status)) return false;
      
      return true;
    });
    
    // Check if we lost points during validation
    if (validatedPoints.length < points.length) {
      console.warn(`Removed ${points.length - validatedPoints.length} invalid points from cache`);
    }
    
    if (validatedPoints.length === 0) {
      console.error('No valid points found in cache');
      return null;
    }
    
    console.log(`Loaded ${validatedPoints.length} valid points from localStorage`);
    return validatedPoints as Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}>;
  } catch (err) {
    console.error('Error loading points from localStorage:', err);
    return null;
  }
};

// Calculate total population of Algeria
const totalPopulation = wilayas.reduce((sum, wilaya) => sum + wilaya.population, 0);

// Calculate number of centers per wilaya based on population percentage
export const getCentersPerWilaya = () => {
    const centersPerWilaya: { [key: string]: number } = {};
    const TOTAL_CENTERS = 1536; // Set exact number of centers
    
    wilayas.forEach(wilaya => {
        const populationPercentage = (wilaya.population / totalPopulation) * 100;
        const calculatedCenters = Math.round((populationPercentage / 100) * TOTAL_CENTERS);
        // Ensure at least 3 centers per wilaya
        centersPerWilaya[wilaya.name] = Math.max(3, calculatedCenters);
    });

    // Adjust to ensure exactly 1536 total centers
    let totalCenters = Object.values(centersPerWilaya).reduce((a, b) => a + b, 0);
    const diff = TOTAL_CENTERS - totalCenters;
    
    if (diff !== 0) {
        // Sort wilayas by population to distribute remaining points to larger wilayas
        const sortedWilayas = wilayas
            .sort((a, b) => b.population - a.population)
            .map(w => w.name);
        
        // Add or subtract points from largest wilayas
        let i = 0;
        while (totalCenters !== TOTAL_CENTERS) {
            const wilayaName = sortedWilayas[i % sortedWilayas.length];
            if (diff > 0 && totalCenters < TOTAL_CENTERS) {
                centersPerWilaya[wilayaName]++;
                totalCenters++;
            } else if (diff < 0 && totalCenters > TOTAL_CENTERS && centersPerWilaya[wilayaName] > 3) {
                centersPerWilaya[wilayaName]--;
                totalCenters--;
            }
            i++;
        }
    }
    
    return centersPerWilaya;
};

// More accurate wilaya coordinate bounds based on actual geographical data
const wilayaBounds: { [key: string]: { minLat: number, maxLat: number, minLng: number, maxLng: number } } = {
    // Northern Region (Coastal Wilayas)
    'Alger': { minLat: 36.65, maxLat: 36.85, minLng: 2.95, maxLng: 3.25 },
    'Oran': { minLat: 35.60, maxLat: 35.80, minLng: -0.70, maxLng: -0.50 },
    'Constantine': { minLat: 36.25, maxLat: 36.45, minLng: 6.55, maxLng: 6.75 },
    'Annaba': { minLat: 36.85, maxLat: 37.05, minLng: 7.70, maxLng: 7.90 },
    'Blida': { minLat: 36.40, maxLat: 36.60, minLng: 2.75, maxLng: 2.95 },
    'Tizi Ouzou': { minLat: 36.65, maxLat: 36.85, minLng: 4.00, maxLng: 4.20 },
    'Béjaïa': { minLat: 36.70, maxLat: 36.90, minLng: 4.95, maxLng: 5.15 },
    'Sétif': { minLat: 36.15, maxLat: 36.35, minLng: 5.30, maxLng: 5.50 },
    'Skikda': { minLat: 36.85, maxLat: 37.05, minLng: 6.85, maxLng: 7.05 },
    'Chlef': { minLat: 36.10, maxLat: 36.30, minLng: 1.25, maxLng: 1.45 },
    'Mostaganem': { minLat: 35.90, maxLat: 36.10, minLng: 0.05, maxLng: 0.25 },
    'Tlemcen': { minLat: 34.85, maxLat: 35.05, minLng: -1.35, maxLng: -1.15 },
    'Boumerdès': { minLat: 36.70, maxLat: 36.90, minLng: 3.35, maxLng: 3.55 },
    'Tipaza': { minLat: 36.55, maxLat: 36.75, minLng: 2.35, maxLng: 2.55 },
    'Bouira': { minLat: 36.30, maxLat: 36.50, minLng: 3.85, maxLng: 4.05 },
    'Médéa': { minLat: 36.20, maxLat: 36.40, minLng: 2.65, maxLng: 2.85 },
    'Relizane': { minLat: 35.65, maxLat: 35.85, minLng: 0.45, maxLng: 0.65 },
    'Jijel': { minLat: 36.75, maxLat: 36.95, minLng: 5.65, maxLng: 5.85 },
    'Aïn Témouchent': { minLat: 35.25, maxLat: 35.45, minLng: -1.25, maxLng: -1.05 },
    'Guelma': { minLat: 36.40, maxLat: 36.60, minLng: 7.35, maxLng: 7.55 },
    'El Tarf': { minLat: 36.65, maxLat: 36.85, minLng: 8.25, maxLng: 8.45 },
    
    // Central Region (Tell Atlas & Highlands)
    'Djelfa': { minLat: 34.55, maxLat: 34.75, minLng: 3.15, maxLng: 3.35 },
    'M\'Sila': { minLat: 35.60, maxLat: 35.80, minLng: 4.45, maxLng: 4.65 },
    'Biskra': { minLat: 34.75, maxLat: 34.95, minLng: 5.65, maxLng: 5.85 },
    'Batna': { minLat: 35.50, maxLat: 35.70, minLng: 6.05, maxLng: 6.25 },
    'Tébessa': { minLat: 35.35, maxLat: 35.55, minLng: 8.05, maxLng: 8.25 },
    'Souk Ahras': { minLat: 36.20, maxLat: 36.40, minLng: 7.85, maxLng: 8.05 },
    'Bordj Bou Arréridj': { minLat: 36.00, maxLat: 36.20, minLng: 4.65, maxLng: 4.85 },
    'Mila': { minLat: 36.35, maxLat: 36.55, minLng: 6.15, maxLng: 6.35 },
    'Sidi Bel Abbès': { minLat: 35.15, maxLat: 35.35, minLng: -0.70, maxLng: -0.50 },
    'Tiaret': { minLat: 35.30, maxLat: 35.50, minLng: 1.25, maxLng: 1.45 },
    'Saïda': { minLat: 34.75, maxLat: 34.95, minLng: 0.05, maxLng: 0.25 },
    'Mascara': { minLat: 35.30, maxLat: 35.50, minLng: 0.05, maxLng: 0.25 },
    'Oum El Bouaghi': { minLat: 35.80, maxLat: 36.00, minLng: 7.05, maxLng: 7.25 },
    'Khenchela': { minLat: 35.35, maxLat: 35.55, minLng: 7.05, maxLng: 7.25 },
    'Aïn Defla': { minLat: 36.20, maxLat: 36.40, minLng: 1.85, maxLng: 2.05 },
    'Laghouat': { minLat: 33.70, maxLat: 33.90, minLng: 2.75, maxLng: 2.95 },
    
    // Southern Region (Sahara)
    'Ouargla': { minLat: 31.85, maxLat: 32.05, minLng: 5.25, maxLng: 5.45 },
    'Adrar': { minLat: 27.75, maxLat: 27.95, minLng: -0.35, maxLng: -0.15 },
    'Tamanrasset': { minLat: 22.65, maxLat: 22.85, minLng: 5.45, maxLng: 5.65 },
    'Béchar': { minLat: 31.55, maxLat: 31.75, minLng: -2.30, maxLng: -2.10 },
    'El Bayadh': { minLat: 33.55, maxLat: 33.75, minLng: 1.00, maxLng: 1.20 },
    'Ghardaïa': { minLat: 32.35, maxLat: 32.55, minLng: 3.60, maxLng: 3.80 },
    'Illizi': { minLat: 26.45, maxLat: 26.65, minLng: 8.35, maxLng: 8.55 },
    'Tindouf': { minLat: 27.55, maxLat: 27.75, minLng: -8.20, maxLng: -8.00 },
    'El Oued': { minLat: 33.30, maxLat: 33.50, minLng: 6.75, maxLng: 6.95 },
    'Naâma': { minLat: 33.20, maxLat: 33.40, minLng: -0.40, maxLng: -0.20 },
    'Tissemsilt': { minLat: 35.55, maxLat: 35.75, minLng: 1.75, maxLng: 1.95 },
    'Timimoun': { minLat: 29.15, maxLat: 29.35, minLng: 0.15, maxLng: 0.35 },
    'Bordj Badji Mokhtar': { minLat: 21.30, maxLat: 21.50, minLng: 0.85, maxLng: 1.05 },
    'Ouled Djellal': { minLat: 34.35, maxLat: 34.55, minLng: 5.00, maxLng: 5.20 },
    'Béni Abbès': { minLat: 30.05, maxLat: 30.25, minLng: -2.25, maxLng: -2.05 },
    'In Salah': { minLat: 27.15, maxLat: 27.35, minLng: 2.45, maxLng: 2.65 },
    'In Guezzam': { minLat: 19.55, maxLat: 19.75, minLng: 5.70, maxLng: 5.90 },
    'Touggourt': { minLat: 33.05, maxLat: 33.25, minLng: 6.00, maxLng: 6.20 },
    'Djanet': { minLat: 24.45, maxLat: 24.65, minLng: 9.45, maxLng: 9.65 },
    'El M\'Ghair': { minLat: 33.85, maxLat: 34.05, minLng: 5.85, maxLng: 6.05 },
    'El Meniaa': { minLat: 30.55, maxLat: 30.75, minLng: 2.80, maxLng: 3.00 }
};

// Default bounds for regions if specific wilaya bounds are not found
const regionBounds = {
    north: { minLat: 35.5, maxLat: 37.0, minLng: 0.0, maxLng: 8.0 },
    center: { minLat: 34.0, maxLat: 35.5, minLng: 0.0, maxLng: 8.0 },
    south: { minLat: 19.0, maxLat: 34.0, minLng: -8.5, maxLng: 12.0 }
};

// Accurately check if a point is inside a GeoJSON polygon
const isPointInWilaya = (lng: number, lat: number, wilayaFeature: any): boolean => {
  try {
    if (!wilayaFeature || !wilayaFeature.geometry) return false;
    
    const point = turf.point([lng, lat]);
    
    // Handle different geometry types
    if (wilayaFeature.geometry.type === 'Polygon') {
      const polygon = turf.polygon(wilayaFeature.geometry.coordinates);
      return turf.booleanPointInPolygon(point, polygon);
    } 
    else if (wilayaFeature.geometry.type === 'MultiPolygon') {
      return wilayaFeature.geometry.coordinates.some((coords: any) => {
        const polygon = turf.polygon(coords);
        return turf.booleanPointInPolygon(point, polygon);
      });
    }
    
    return false;
  } catch (error) {
    console.error('Error in point-in-polygon check:', error);
    return false;
  }
};

// Randomly assign a status with probabilities
const generateRandomStatus = (): 'normal' | 'warning' | 'alert' => {
  const r = Math.random();
  // 80% normal, 15% warning, 5% alert
  if (r < 0.80) return 'normal';
  if (r < 0.95) return 'warning';
  return 'alert';
};

// Generate coordinates for a specific wilaya, ensuring they are inside the wilaya boundaries
export const generateCoordinatesForWilaya = async (
  wilayaName: string, 
  count: number, 
  geoJSON: any
): Promise<Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}>> => {
  const results: Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}> = [];
  
  if (!geoJSON) {
    console.error('GeoJSON data is required for accurate point generation');
    return results;
  }
  
  // Find the wilaya feature
  const wilayaFeature = geoJSON.features.find((f: any) => f.properties.name === wilayaName);
  if (!wilayaFeature) {
    console.error(`Wilaya "${wilayaName}" not found in GeoJSON data`);
    return results;
  }
  
  // Get bounds for the wilaya to restrict random point generation
  const specificBounds = wilayaBounds[wilayaName];
  const isNorthernWilaya = [
    'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Tizi Ouzou', 'Béjaïa', 'Sétif', 'Skikda',
    'Chlef', 'Mostaganem', 'Tlemcen', 'Boumerdès', 'Tipaza', 'Bouira', 'Médéa', 'Relizane'
  ].includes(wilayaName);

  const isCentralWilaya = [
    'Djelfa', 'M\'Sila', 'Biskra', 'Batna', 'Tébessa', 'Guelma', 'Souk Ahras', 'El Tarf',
    'Bordj Bou Arréridj', 'Mila', 'Jijel', 'Sidi Bel Abbès', 'Tiaret', 'Saïda'
  ].includes(wilayaName);
  
  const bounds = specificBounds || (isNorthernWilaya ? regionBounds.north : 
                          isCentralWilaya ? regionBounds.center : 
                          regionBounds.south);
  
  // Generate the requested number of points inside the wilaya with more dispersion
  let attempts = 0;
  const MAX_ATTEMPTS = 150000; // Increase max attempts for better dispersion
  let i = 0;
  
  console.log(`Generating ${count} points for ${wilayaName}...`);
  
  // Track generated points to ensure dispersion
  const generatedPoints: Array<[number, number]> = [];
  const MIN_DISTANCE = 0.05; // Minimum distance between points (in degrees)
  
  while (i < count && attempts < MAX_ATTEMPTS) {
    attempts++;
    
    // Generate a random point within the bounds
    const lat = bounds.minLat + Math.random() * (bounds.maxLat - bounds.minLat);
    const lng = bounds.minLng + Math.random() * (bounds.maxLng - bounds.minLng);
    
    // Check if point is far enough from existing points
    const isTooClose = generatedPoints.some(([existingLat, existingLng]) => {
      const latDiff = Math.abs(existingLat - lat);
      const lngDiff = Math.abs(existingLng - lng);
      return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) < MIN_DISTANCE;
    });
    
    // If too close to another point, try again
    if (isTooClose) continue;
    
    // Check if the point is inside the wilaya
    if (isPointInWilaya(lng, lat, wilayaFeature)) {
      const status = generateRandomStatus();
      results.push({ 
        position: [lat, lng], 
        wilaya: wilayaName,
        status
      });
      
      // Track this point for dispersion check
      generatedPoints.push([lat, lng]);
      
      i++;
      
      // Reset attempts counter on success
      if (i % 10 === 0) {
        attempts = 0;
      }
    }
    
    // If too many failed attempts, log a warning
    if (attempts === MAX_ATTEMPTS) {
      console.warn(`Max attempts reached for ${wilayaName}. Generated ${i}/${count} points.`);
      break;
    }
  }
  
  return results;
};

// Generate accurate points for all wilayas
const generateAllCentersFromScratch = async (): Promise<Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}>> => {
    console.log('Generating new center points from scratch...');
    const centersPerWilaya = getCentersPerWilaya();
    const allCenters: Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}> = [];

    // Load GeoJSON data first
    const geoJSONData = await loadGeoJSONData();
    if (!geoJSONData) {
      console.error("Failed to load GeoJSON data for point generation");
      return [];
    }
    
    // Process each wilaya in sequence
    for (const [wilayaName, count] of Object.entries(centersPerWilaya)) {
        try {
            const pointsForWilaya = await generateCoordinatesForWilaya(wilayaName, count, geoJSONData);
            allCenters.push(...pointsForWilaya);
            console.log(`Successfully generated ${pointsForWilaya.length} points for ${wilayaName}`);
        } catch (error) {
            console.error(`Error generating coordinates for ${wilayaName}:`, error);
        }
    }

    console.log(`Total generated points: ${allCenters.length}`);
    
    // Save the generated points to localStorage for future use
    savePointsToStorage(allCenters);
    
    return allCenters;
};

// Generate all centers for all wilayas or load from cache
export const generateAllCenters = async (): Promise<Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}>> => {
    // If we have an in-memory cache, use it
    if (allCentersCache) {
        console.log('Using in-memory centers cache');
        return allCentersCache;
    }
    
    try {
        // Try to load from localStorage
        const cachedPoints = loadPointsFromStorage();
        if (cachedPoints && cachedPoints.length > 0) {
            console.log(`Using ${cachedPoints.length} cached points from localStorage`);
            allCentersCache = cachedPoints;
            return cachedPoints;
        }
    } catch (error) {
        console.error('Error loading points from cache:', error);
        // Continue to generate new points
    }
    
    // No cache available or cache loading failed, generate points from scratch
    console.log('No valid cache found, generating new points...');
    const freshPoints = await generateAllCentersFromScratch();
    allCentersCache = freshPoints;
    return freshPoints;
};

// Add a function to export points data for backup
export const exportPointsData = (): string => {
    try {
        const points = loadPointsFromStorage();
        if (!points || points.length === 0) {
            throw new Error('No points data available to export');
        }
        
        return JSON.stringify(points);
    } catch (error) {
        console.error('Error exporting points data:', error);
        throw error;
    }
}; 