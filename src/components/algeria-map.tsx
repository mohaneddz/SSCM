import React, { useEffect, useRef, useCallback, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Search } from 'lucide-react';

declare module 'leaflet' {
    export function markerClusterGroup(options?: any): any;
}

interface AlgeriaMapProps {
    zoom: number;
    onZoom: (zoom: number) => void;
    onLocationClick: (locationId: string, wilaya?: string) => void;
    searchQuery: string;
    selectedWilaya: string | null;
}

// Cache for wilayas data to prevent repeated API calls
let wilayasCache: any = null;

const AlgeriaMap: React.FC<AlgeriaMapProps> = ({
    zoom,
    onZoom,
    onLocationClick,
    searchQuery,
    selectedWilaya
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
    const wilayaLayersRef = useRef<{[key: string]: L.GeoJSON}>({});
    const activeWilayaLayerRef = useRef<L.GeoJSON | null>(null);
    const markerCacheRef = useRef<Map<number, [number, number][]>>(new Map());
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [wilayaData, setWilayaData] = useState<any>(null);
    const currentlySelectedMarkerRef = useRef<L.Marker | null>(null);

    // Function to fetch wilaya data
    const fetchWilayaData = useCallback(async () => {
        try {
            setLoading(true);
            
            // Check cache first
            if (wilayasCache) {
                setWilayaData(wilayasCache);
                setLoading(false);
                return wilayasCache;
            }

            const response = await fetch('/dz.json');
            if (!response.ok) {
                throw new Error('Failed to load GeoJSON data');
            }
            
            const data = await response.json();
            wilayasCache = data; // Store in cache
            setWilayaData(data);
            setLoading(false);
            return data;
        } catch (err) {
            console.error('Error loading GeoJSON:', err);
            setError('Failed to load map data. Please refresh the page.');
            setLoading(false);
            return null;
        }
    }, []);

    // Initialize map
    useEffect(() => {
        const initMap = async () => {
            if (!mapRef.current) {
                // Initialize the map centered on Algeria
                mapRef.current = L.map('map', {
                    center: [28.0339, 2.9999],
                    zoom: 6,
                    zoomControl: true,
                    attributionControl: false,
                    minZoom: 4,
                    maxZoom: 10,
                    preferCanvas: true,
                    zoomSnap: 0.5,
                    zoomDelta: 0.5
                });

                // Set the background color
                if (mapRef.current) {
                    mapRef.current.getContainer().style.background = '#0c1f47';
                }

                // Fetch wilaya data
                const data = await fetchWilayaData();
                
                if (data && mapRef.current) {
                    // Create individual wilaya layers
                    data.features.forEach((feature: any) => {
                        const wilayaName = feature.properties.name;
                        wilayaLayersRef.current[wilayaName] = L.geoJSON(feature, {
                            style: {
                                color: '#2fb96c',
                                weight: 2,
                                opacity: 1,
                                fillColor: '#2fb96c',
                                fillOpacity: 0.2
                            }
                        });
                    });
                    
                    // Create full Algeria layer
                    activeWilayaLayerRef.current = L.geoJSON(data, {
                        style: {
                            color: '#2fb96c',
                            weight: 2,
                            opacity: 1,
                            fillColor: '#2fb96c',
                            fillOpacity: 0.1
                        }
                    }).addTo(mapRef.current);
                    
                    // Define Algeria bounds and fit map
                    const algeriaBounds: L.LatLngBoundsExpression = [[18, -9], [37, 12]];
                    mapRef.current.fitBounds(algeriaBounds);
                    
                    // Add zoom event listener
                    mapRef.current.on('zoomend', () => {
                        if (mapRef.current) {
                            onZoom(mapRef.current.getZoom());
                            throttledUpdateMarkers();
                        }
                    });
                    
                    // Initialize markers
                    updateMarkers();
                }
            }
        };
        
        initMap();
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
        };
    }, [fetchWilayaData]);

    // Handle wilaya selection changes
    useEffect(() => {
        if (!mapRef.current || !wilayaData) return;
        
        // Clear current active layer
        if (activeWilayaLayerRef.current) {
            mapRef.current.removeLayer(activeWilayaLayerRef.current);
            activeWilayaLayerRef.current = null;
        }
        
        if (selectedWilaya && wilayaLayersRef.current[selectedWilaya]) {
            // Add selected wilaya layer
            activeWilayaLayerRef.current = wilayaLayersRef.current[selectedWilaya];
            mapRef.current.addLayer(activeWilayaLayerRef.current);
            
            // Find and zoom to the selected wilaya
            const feature = wilayaData.features.find((f: any) => 
                f.properties.name === selectedWilaya
            );
            
            if (feature) {
                const tempLayer = L.geoJSON(feature);
                mapRef.current.fitBounds(tempLayer.getBounds(), {
                    padding: [20, 20],
                    maxZoom: 8
                });
            }
        } else {
            // Add full Algeria layer if no wilaya is selected
            activeWilayaLayerRef.current = L.geoJSON(wilayaData, {
                style: {
                    color: '#2fb96c',
                    weight: 2,
                    opacity: 1,
                    fillColor: '#2fb96c',
                    fillOpacity: 0.1
                }
            }).addTo(mapRef.current);
            
            // Reset view to full Algeria
            const algeriaBounds: L.LatLngBoundsExpression = [[18, -9], [37, 12]];
            mapRef.current.fitBounds(algeriaBounds);
        }
        
        // Clear the marker cache to regenerate markers
        markerCacheRef.current.clear();
        
        // Update markers based on new view
        throttledUpdateMarkers();
    }, [selectedWilaya, wilayaData]);

    // Update markers when search or zoom changes
    useEffect(() => {
        throttledUpdateMarkers();
    }, [zoom, searchQuery]);

    // Throttle marker updates for better performance
    const throttledUpdateMarkers = () => {
        if (updateTimeoutRef.current) {
            clearTimeout(updateTimeoutRef.current);
        }
        
        updateTimeoutRef.current = setTimeout(() => {
            updateMarkers();
        }, 150);
    };

    // Find wilaya from coordinates
    const findWilayaFromCoordinates = useCallback((lat: number, lng: number): string => {
        if (!wilayaData) return "Unknown";
        
        const point = L.latLng(lat, lng);
        
        for (const feature of wilayaData.features) {
            if (feature.geometry && feature.properties) {
                const layer = L.geoJSON(feature);
                if (layer.getBounds().contains(point)) {
                    return feature.properties.name || "Unknown";
                }
            }
        }
        
        return "Unknown";
    }, [wilayaData]);

    // Check if a point is in selected wilaya
    const isPointInSelectedWilaya = useCallback((lat: number, lng: number): boolean => {
        if (!selectedWilaya || !wilayaData) return true;
        
        const point = L.latLng(lat, lng);
        const feature = wilayaData.features.find((f: any) => 
            f.properties.name === selectedWilaya
        );
        
        if (feature) {
            const layer = L.geoJSON(feature);
            return layer.getBounds().contains(point);
        }
        
        return false;
    }, [selectedWilaya, wilayaData]);

    // Update markers on map
    const updateMarkers = useCallback(() => {
        if (!mapRef.current || !wilayaData) return;

        // Remove existing marker cluster
        if (markerClusterRef.current) {
            mapRef.current.removeLayer(markerClusterRef.current);
        }
        
        // Clear marker references
        markersRef.current.forEach((marker) => {
            if (marker) marker.remove();
        });
        markersRef.current = [];

        const bounds = mapRef.current.getBounds();
        const roundedZoom = Math.round(zoom);
        let visibleMarkers: [number, number][] = [];
        
        // Check cache for markers at this zoom level
        if (markerCacheRef.current.has(roundedZoom)) {
            visibleMarkers = markerCacheRef.current.get(roundedZoom)!.filter(
                ([lat, lng]) => bounds.contains([lat, lng])
            );
        } else {
            // Generate markers appropriate for the zoom level
            const numMarkers = Math.min(200, Math.round(zoom * zoom * 3));
            
            for (let i = 0; i < numMarkers; i++) {
                const lat = getRandomLat(zoom);
                const lng = getRandomLng(zoom);

                // Skip if we already have a marker nearby
                if (visibleMarkers.find((e) => 
                    Math.abs(e[0] - lat) < 0.1 && Math.abs(e[1] - lng) < 0.1)) continue;

                // Check if point is within visible bounds
                if (bounds.contains([lat, lng])) {
                    visibleMarkers.push([lat, lng]);
                }
            }
            
            // Cache markers for this zoom level
            markerCacheRef.current.set(roundedZoom, [...visibleMarkers]);
        }

        // Create marker cluster group
        markerClusterRef.current = L.markerClusterGroup({
            maxClusterRadius: 40,
            chunkedLoading: true,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: false,
            iconCreateFunction: function(cluster) {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<div style="background-color: #2fb96c; width: ${Math.min(20 + count/2, 40)}px; height: ${Math.min(20 + count/2, 40)}px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #ffffff; font-size: 12px; font-weight: bold; box-shadow: 0 0 10px rgba(47, 185, 108, 0.7);">${count}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40)
                });
            }
        });

        // Filter markers by search and wilaya
        const filteredMarkers = visibleMarkers.filter(([lat, lng]) => {
            // Skip points not in selected wilaya
            if (!isPointInSelectedWilaya(lat, lng)) return false;
            
            // Filter by search query if present
            if (searchQuery) {
                return generateLocationId(lat, lng).toLowerCase().includes(searchQuery.toLowerCase());
            }
            
            return true;
        });

        // Add markers to map
        filteredMarkers.forEach(([lat, lng]) => {
            const locationId = generateLocationId(lat, lng);
            const wilaya = findWilayaFromCoordinates(lat, lng);
            
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="marker-pin" style="background-color: #2fb96c; width: 15px; height: 15px; border-radius: 50%; cursor: pointer; box-shadow: 0 0 8px rgba(47, 185, 108, 0.8); transition: all 0.3s ease;"></div>`,
                    iconSize: [15, 15],
                    iconAnchor: [7.5, 7.5],
                }),
                interactive: true,
                bubblingMouseEvents: false
            });

            // Click handler
            marker.on('click', (e) => {
                // Stop propagation
                L.DomEvent.stopPropagation(e);
                
                // Reset previously selected marker
                if (currentlySelectedMarkerRef.current) {
                    const prevPinElement = currentlySelectedMarkerRef.current.getElement()?.querySelector('.marker-pin');
                    if (prevPinElement) {
                        (prevPinElement as HTMLElement).style.backgroundColor = '#2fb96c';
                        (prevPinElement as HTMLElement).style.width = '15px';
                        (prevPinElement as HTMLElement).style.height = '15px';
                    }
                }
                
                // Update current marker
                const pinElement = marker.getElement()?.querySelector('.marker-pin');
                if (pinElement) {
                    (pinElement as HTMLElement).style.backgroundColor = '#ff0000';
                    (pinElement as HTMLElement).style.width = '22px';
                    (pinElement as HTMLElement).style.height = '22px';
                }
                
                // Store reference to currently selected marker
                currentlySelectedMarkerRef.current = marker;
                
                // Call the callback with location info
                onLocationClick(locationId, wilaya);
            });
            
            markerClusterRef.current!.addLayer(marker);
            markersRef.current.push(marker);
        });

        // Add marker cluster to map
        if (mapRef.current && markerClusterRef.current) {
            mapRef.current.addLayer(markerClusterRef.current);
        }
    }, [zoom, searchQuery, wilayaData, selectedWilaya, onLocationClick, findWilayaFromCoordinates, isPointInSelectedWilaya]);

    // Generate random coordinates
    const getRandomLat = (zoom: number): number => {
        const baseLat = 35.0 + Math.random() * 7;
        const southBias = (1 - zoom / 18) * -10;
        return Math.max(19.0, baseLat + southBias + (Math.random() - 0.5) * 2);
    };

    const getRandomLng = (zoom: number): number => {
        const baseLng = 2.0 + (Math.random() - 0.5) * 8;
        return Math.min(12.0, Math.max(-8.0, baseLng));
    };

    const generateLocationId = (lat: number, lng: number): string => {
        return `Mobilis_${lat.toFixed(4)}_${lng.toFixed(4)}`;
    };

    // Show loading state
    if (loading) {
        return (
            <div id="map" className="border rounded-md border-neutral-200 bg-gray-900 flex items-center justify-center" style={{ height: '100%', width: '100%' }}>
                <div className="text-white flex flex-col items-center gap-2">
                    <div className="w-8 h-8 border-t-2 border-blue-500 rounded-full animate-spin"></div>
                    <p>Loading map data...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div id="map" className="border rounded-md border-neutral-200 bg-gray-900 flex items-center justify-center" style={{ height: '100%', width: '100%' }}>
                <div className="text-red-400 flex flex-col items-center gap-2 p-4 text-center">
                    <p>{error}</p>
                    <button 
                        onClick={() => fetchWilayaData()}
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div id="map" className="border rounded-md border-neutral-200" style={{ height: '100%', width: '100%', position: 'relative' }}>
            <style jsx>{`
                :global(.leaflet-control-container) {
                    display: block;
                }
                :global(.leaflet-control-zoom) {
                    margin-right: 15px;
                    margin-bottom: 25px;
                }
                :global(.leaflet-tile-pane) {
                    display: none;
                }
                :global(.custom-marker:hover .marker-pin) {
                    transform: scale(1.2);
                    transition: transform 0.2s ease;
                }
                :global(.leaflet-marker-icon) {
                    cursor: pointer !important;
                }
                :global(.leaflet-marker-icon.leaflet-interactive) {
                    pointer-events: auto !important;
                }
                :global(.leaflet-interactive) {
                    outline: none !important;
                }
            `}</style>
        </div>
    );
};

export default AlgeriaMap;