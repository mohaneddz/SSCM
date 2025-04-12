import React, { useEffect, useRef, useCallback, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Search, RefreshCcw } from 'lucide-react';
import { generateAllCenters } from '@/utils/mobilis-centers';
import { useTheme } from 'next-themes';

declare module 'leaflet' {
    export function markerClusterGroup(options?: any): any;
}

interface AlgeriaMapProps {
    zoom: number;
    onZoom: (zoom: number) => void;
    onLocationClick: (locationId: string, wilaya?: string, status?: 'normal' | 'warning' | 'alert') => void;
    searchQuery: string;
    selectedWilaya: string | null;
    selectedLocationId: string | null;
    selectionMode?: boolean; // Optional prop for site selection mode
}

// Cache for wilayas data to prevent repeated API calls
let wilayasCache: any = null;

const AlgeriaMap: React.FC<AlgeriaMapProps> = ({
    zoom,
    onZoom,
    onLocationClick,
    searchQuery,
    selectedWilaya,
    selectedLocationId,
    selectionMode = false // Default to false
}) => {
    const { theme } = useTheme(); // Get current theme
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);
    const markerClusterRef = useRef<L.MarkerClusterGroup | null>(null);
    const importantMarkersRef = useRef<L.Marker[]>([]);
    const wilayaLayersRef = useRef<{[key: string]: L.GeoJSON}>({});
    const activeWilayaLayerRef = useRef<L.GeoJSON | null>(null);
    const markerCacheRef = useRef<Map<number, any[]>>(new Map());
    const fixedCoordinatesRef = useRef<Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}>>([]);
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [wilayaData, setWilayaData] = useState<any>(null);
    const currentlySelectedMarkerRef = useRef<L.Marker | null>(null);
    const [pointsSource, setPointsSource] = useState<'cache' | 'generated' | null>(null);
    const [pointCount, setPointCount] = useState<number>(0);

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

    // Add a function to clear the points cache
    const clearPointsCache = useCallback(() => {
        try {
            // First, create a backup of the current points if they exist
            const currentData = localStorage.getItem('mobilis-centers-cache');
            if (currentData) {
                const backupDate = new Date().toISOString().replace(/:/g, '-');
                localStorage.setItem(`mobilis-centers-backup-${backupDate}`, currentData);
                console.log(`Created backup: mobilis-centers-backup-${backupDate}`);
            }
            
            // Now clear the cache
            localStorage.removeItem('mobilis-centers-cache');
            
            // Show confirmation message
            alert('Points cache cleared successfully. A backup was created. Refresh the page to regenerate points.');
            
            // Ask if user wants to reload the page
            if (confirm('Would you like to reload the page now to generate new points?')) {
                window.location.reload();
            }
        } catch (err) {
            console.error('Error clearing cache:', err);
            alert('Failed to clear cache. Check console for details.');
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
                    minZoom: 6,
                    maxZoom: 10,
                    preferCanvas: true,
                    zoomDelta: 0.5
                });

                // Set the background color based on theme
                if (mapRef.current) {
                    mapRef.current.getContainer().style.background = theme === 'dark' ? '#081024' : '#f9f9f9';
                }

                try {
                    // Generate centers based on population distribution
                    setLoading(true);
                    
                    // Check if we're loading from cache by temporarily storing localStorage status
                    const hasCache = localStorage.getItem('mobilis-centers-cache') !== null;
                    
                    const allCenters = await generateAllCenters();
                    fixedCoordinatesRef.current = allCenters;
                    setPointCount(allCenters.length);
                    
                    // Set the points source for UI display
                    setPointsSource(hasCache ? 'cache' : 'generated');

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
                                    fillOpacity: 0.2,
                                    interactive: false
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
                                fillOpacity: 0.1,
                                interactive: false
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
                } catch (err) {
                    console.error('Error initializing map:', err);
                    setError('Failed to initialize map with accurate points. Please refresh the page.');
                } finally {
                    setLoading(false);
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
    }, [fetchWilayaData, theme]); // Add theme as a dependency

    // Add effect to update map background when theme changes
    useEffect(() => {
        if (mapRef.current) {
            mapRef.current.getContainer().style.background = theme === 'dark' ? '#081024' : '#f9f9f9';
        }
    }, [theme]);

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
                    fillOpacity: 0.1,
                    interactive: false
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

        // Remove existing marker cluster and important markers
        if (markerClusterRef.current) {
            mapRef.current.removeLayer(markerClusterRef.current);
        }
        
        // Clear marker references
        markersRef.current.forEach((marker) => {
            if (marker) marker.remove();
        });
        markersRef.current = [];
        
        // Clear important markers too
        importantMarkersRef.current.forEach((marker) => {
            if (marker) marker.remove();
        });
        importantMarkersRef.current = [];

        const bounds = mapRef.current.getBounds();
        
        // Add validation and error handling for point data
        let visibleMarkers: Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}> = [];
        try {
            visibleMarkers = fixedCoordinatesRef.current.filter(
                (point) => {
                    // Verify the point has the proper structure and position property
                    if (!point || !point.position || !Array.isArray(point.position) || point.position.length < 2) {
                        console.warn('Invalid point data found:', point);
                        return false;
                    }
                    
                    // Now it's safe to access position[0] and position[1]
                    return bounds.contains([point.position[0], point.position[1]]);
                }
            );
        } catch (error) {
            console.error('Error filtering visible markers:', error);
            // Fallback if there's an error
            visibleMarkers = [];
        }

        // Log information for debugging
        console.log(`Displaying ${visibleMarkers.length} visible markers out of ${fixedCoordinatesRef.current.length} total`);

        // Create marker cluster group for normal points only
        markerClusterRef.current = L.markerClusterGroup({
            maxClusterRadius: 40,
            chunkedLoading: true,
            zoomToBoundsOnClick: true,
            spiderfyOnMaxZoom: false,
            showCoverageOnHover: false,
            disableClusteringAtZoom: 10,
            removeOutsideVisibleBounds: true,
            animate: true,
            animateAddingMarkers: false, // Disable animation when adding markers
            iconCreateFunction: function(cluster) {
                const count = cluster.getChildCount();
                return L.divIcon({
                    html: `<div style="background-color: #2fb96c; width: ${Math.min(20 + count/2, 40)}px; height: ${Math.min(20 + count/2, 40)}px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: #ffffff; font-size: 12px; font-weight: bold; box-shadow: 0 0 10px rgba(47, 185, 108, 0.7);">${count}</div>`,
                    className: 'custom-cluster',
                    iconSize: L.point(40, 40),
                    iconAnchor: L.point(20, 20)
                });
            }
        });

        // Filter markers by search and wilaya
        let filteredMarkers: Array<{position: [number, number], wilaya: string, status: 'normal' | 'warning' | 'alert'}> = [];
        try {
            filteredMarkers = visibleMarkers.filter((point) => {
                // Skip invalid points
                if (!point || !point.position || !Array.isArray(point.position) || point.position.length < 2) {
                    return false;
                }
                
                // Skip points not in selected wilaya
                if (!isPointInSelectedWilaya(point.position[0], point.position[1])) return false;
                
                // Filter by search query if present
                if (searchQuery) {
                    return generateLocationId(point.position[0], point.position[1]).toLowerCase().includes(searchQuery.toLowerCase());
                }
                
                return true;
            });
        } catch (error) {
            console.error('Error filtering markers by criteria:', error);
            filteredMarkers = [];
        }

        // Add markers to map
        filteredMarkers.forEach((point) => {
            const lat = point.position[0];
            const lng = point.position[1];
            const status = point.status;
            const wilaya = point.wilaya;
            const locationId = generateLocationId(lat, lng);
            const isSelected = selectedLocationId === locationId;
            
            // Determine marker style based on status and selection
            const markerColor = isSelected ? '#0066ff' : 
                               status === 'alert' ? '#ff3333' : 
                               status === 'warning' ? '#ffcc00' : 
                               '#2fb96c';
            
            // Determine marker size based on status
            const markerSize = isSelected ? 22 : 
                              status === 'alert' ? 20 : 
                              status === 'warning' ? 18 : 
                              15;
            
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div class="marker-pin" style="background-color: ${markerColor}; width: ${markerSize}px; height: ${markerSize}px; border-radius: 50%; cursor: pointer; box-shadow: 0 0 8px ${isSelected ? 'rgba(0, 102, 255, 0.8)' : (status === 'alert' ? 'rgba(255, 51, 51, 0.8)' : status === 'warning' ? 'rgba(255, 204, 0, 0.8)' : 'rgba(47, 185, 108, 0.8)')}; transition: all 0.3s ease; transform: ${isSelected ? 'scale(1.2)' : status !== 'normal' ? 'scale(1.1)' : 'scale(1)'};"></div>`,
                    iconSize: [markerSize, markerSize],
                    iconAnchor: [markerSize/2, markerSize/2],
                }),
                interactive: true,
                bubblingMouseEvents: false
            });

            // Add tooltip to marker with status info
            marker.bindTooltip(`Location ID: ${locationId}<br>Wilaya: ${wilaya}<br>Status: ${status.charAt(0).toUpperCase() + status.slice(1)}`, {
                direction: 'top',
                offset: L.point(0, -10),
                opacity: 0.9,
                className: `custom-tooltip custom-tooltip-${status}`
            });

            // Click handler
            marker.on('click', (e) => {
                // Stop propagation
                L.DomEvent.stopPropagation(e);
                
                // Reset previously selected marker with animation
                if (currentlySelectedMarkerRef.current) {
                    const prevPinElement = currentlySelectedMarkerRef.current.getElement()?.querySelector('.marker-pin');
                    if (prevPinElement) {
                        (prevPinElement as HTMLElement).style.transition = 'all 0.3s ease';
                        // Restore proper color based on status
                        const prevMarker = markersRef.current.find(m => m === currentlySelectedMarkerRef.current) || 
                                         importantMarkersRef.current.find(m => m === currentlySelectedMarkerRef.current);
                        const prevData = fixedCoordinatesRef.current.find(p => 
                            generateLocationId(p.position[0], p.position[1]) === 
                            generateLocationId(currentlySelectedMarkerRef.current?.getLatLng().lat || 0, currentlySelectedMarkerRef.current?.getLatLng().lng || 0)
                        );
                        const prevStatus = prevData?.status || 'normal';
                        const prevColor = prevStatus === 'alert' ? '#ff3333' : 
                                         prevStatus === 'warning' ? '#ffcc00' : 
                                         '#2fb96c';
                        const prevSize = prevStatus === 'alert' ? 20 : 
                                        prevStatus === 'warning' ? 18 : 
                                        15;
                        
                        (prevPinElement as HTMLElement).style.backgroundColor = prevColor;
                        (prevPinElement as HTMLElement).style.width = `${prevSize}px`;
                        (prevPinElement as HTMLElement).style.height = `${prevSize}px`;
                        (prevPinElement as HTMLElement).style.transform = prevStatus !== 'normal' ? 'scale(1.1)' : 'scale(1)';
                    }
                }
                
                // Update current marker with animation
                const pinElement = marker.getElement()?.querySelector('.marker-pin');
                if (pinElement) {
                    (pinElement as HTMLElement).style.transition = 'all 0.3s ease';
                    (pinElement as HTMLElement).style.backgroundColor = '#0066ff';
                    (pinElement as HTMLElement).style.width = '22px';
                    (pinElement as HTMLElement).style.height = '22px';
                    (pinElement as HTMLElement).style.transform = 'scale(1.2)';
                }
                
                // Store reference to currently selected marker
                currentlySelectedMarkerRef.current = marker;
                
                // Call the callback with location info
                onLocationClick(locationId, wilaya, status);
            });
            
            // Store reference if this is the selected marker
            if (isSelected) {
                currentlySelectedMarkerRef.current = marker;
            }
            
            // Add marker to appropriate collection
            if (status === 'normal') {
                // Normal markers go in clusters
                markerClusterRef.current!.addLayer(marker);
                markersRef.current.push(marker);
            } else {
                // Important markers (warning/alert) are added directly to the map
                marker.addTo(mapRef.current!);
                importantMarkersRef.current.push(marker);
            }
        });

        // Add marker cluster to map
        if (mapRef.current && markerClusterRef.current) {
            mapRef.current.addLayer(markerClusterRef.current);
        }
    }, [zoom, searchQuery, wilayaData, selectedWilaya, selectedLocationId, onLocationClick, findWilayaFromCoordinates, isPointInSelectedWilaya]);

    // Add effect to handle selectedLocationId changes
    useEffect(() => {
        if (selectedLocationId === null && currentlySelectedMarkerRef.current) {
            // Reset marker style when selection is cleared
            const pinElement = currentlySelectedMarkerRef.current.getElement()?.querySelector('.marker-pin');
            if (pinElement) {
                (pinElement as HTMLElement).style.transition = 'all 0.3s ease';
                (pinElement as HTMLElement).style.backgroundColor = '#2fb96c';
                (pinElement as HTMLElement).style.width = '15px';
                (pinElement as HTMLElement).style.height = '15px';
                (pinElement as HTMLElement).style.transform = 'scale(1)';
            }
            currentlySelectedMarkerRef.current = null;
        }
        
        // Update markers to reflect the new selection
        throttledUpdateMarkers();
    }, [selectedLocationId, throttledUpdateMarkers]);

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

    return (
        <div className="relative w-full h-full">
            <div id="map" className="absolute inset-0 border rounded-md border-neutral-200" style={{ height: '100%', width: '100%' }}>
                {/* Map will be rendered here */}
            </div>
            
            {/* Points information panel */}
            {pointsSource && (
                <div className="absolute bottom-3 left-3 z-[2000] bg-black/70 text-white text-xs rounded-md px-3 py-2 shadow-lg">
                    <div>
                        <span className="font-medium">Source:</span> {pointsSource === 'cache' ? 'Cached' : 'Freshly Generated'}
                    </div>
                    <div>
                        <span className="font-medium">Total Points:</span> 1533
                    </div>
                    <div className="mt-1 text-[10px]">
                        <span className="inline-block w-2 h-2 rounded-full bg-[#2fb96c] mr-1"></span> Normal
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#ffcc00] mr-1"></span> Warning
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#ff3333] mr-1"></span> Alert
                    </div>
                </div>
            )}
            
            {/* Cache control button */}
            <div className="absolute bottom-3 right-3 z-[2000]">
                <button 
                    onClick={clearPointsCache}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-full p-2 shadow-lg transition-colors duration-200"
                    title="Clear points cache"
                >
                    <RefreshCcw size={16} />
                </button>
            </div>
            
            {/* Error message */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center z-[2000] bg-black/50">
                    <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
                        <div className="text-red-500 mb-4">
                            <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-center mb-2">Failed to Load Map</h3>
                        <p className="text-sm text-gray-600 text-center mb-4">{error}</p>
                        <div className="flex justify-center">
                            <button 
                                onClick={() => fetchWilayaData()}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors duration-200"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Loading overlay */}
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center z-[2000] bg-black/50">
                    <div className="text-white flex flex-col items-center gap-4 animate-fadeIn">
                        <div className="relative">
                            <div className="w-12 h-12 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-b-2 border-l-2 border-blue-300 rounded-full animate-pulse"></div>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-lg font-medium">Loading Map Data</p>
                            <p className="text-sm text-gray-400">Please wait while we prepare your visualization</p>
                        </div>
                    </div>
                </div>
            )}
            
            <style jsx>{`
                :global(.leaflet-control-container) {
                    position: relative;
                    z-index: 1000;
                }
                :global(.leaflet-control-zoom) {
                    margin-right: 15px;
                    margin-bottom: 25px;
                    border-radius: 8px;
                    overflow: hidden;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    z-index: 1000;
                }
                :global(.leaflet-pane) {
                    z-index: 400 !important;
                }
                :global(.leaflet-top, .leaflet-bottom) {
                    z-index: 1000 !important;
                }
                :global(.leaflet-marker-pane) {
                    z-index: 600 !important;
                }
                :global(.leaflet-popup-pane) {
                    z-index: 700 !important;
                }
                :global(.leaflet-tooltip-pane) {
                    z-index: 650 !important;
                }
                :global(#map) {
                    z-index: 1;
                    position: relative;
                }
                :global(.custom-marker) {
                    z-index: 500;
                }
                :global(.custom-marker:hover .marker-pin) {
                    transform: scale(1.2);
                    transition: transform 0.2s ease;
                }
                :global(.leaflet-marker-icon) {
                    cursor: pointer !important;
                    transition: transform 0.2s ease;
                }
                :global(.leaflet-marker-icon.leaflet-interactive) {
                    pointer-events: auto !important;
                }
                :global(.leaflet-interactive) {
                    outline: none !important;
                }
                :global(.custom-tooltip) {
                    background-color: rgba(0, 0, 0, 0.8);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 6px;
                    padding: 8px 12px;
                    font-size: 12px;
                    color: white;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    z-index: 1500 !important;
                }
                :global(.custom-tooltip-warning) {
                    border-color: rgba(255, 204, 0, 0.5);
                }
                :global(.custom-tooltip-alert) {
                    border-color: rgba(255, 51, 51, 0.5);
                }
                :global(.custom-cluster) {
                    transition: transform 0.2s ease;
                    cursor: pointer !important;
                    z-index: 500;
                }
                :global(.custom-cluster:hover) {
                    transform: scale(1.1);
                }
                :global(.leaflet-grab) {
                    cursor: default;
                }
                :global(.leaflet-dragging .leaflet-grab) {
                    cursor: grabbing !important;
                }
                :global(.leaflet-container) {
                    cursor: default;
                }
                :global(.marker-pin) {
                    cursor: pointer !important;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default AlgeriaMap;