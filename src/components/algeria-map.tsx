import React, { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.markercluster/dist/leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import algeriaWilayas from './all-wilayas.geojson'; // Import GeoJSON file
import * as GeoJSON from 'geojson'; // Import the geojson type

declare module 'leaflet' {
    export function markerClusterGroup(options?: any): any;
    interface GeoJSONOptions {
        style?: ((feature: any) => any) | undefined;
    }
    function geoJSON<P>(
        geojson?: GeoJSON.GeoJSON | undefined,
        options?: GeoJSONOptions | undefined
    ): L.GeoJSON<P>;
}

interface AlgeriaMapProps {
    zoom: number;
    onZoom: (zoom: number) => void;
    onLocationClick: (locationId: string) => void;
    searchQuery: string;
}

const AlgeriaMap: React.FC<AlgeriaMapProps> = ({
    zoom,
    onZoom,
    onLocationClick,
    searchQuery,
}) => {
    const mapRef = useRef<L.Map | null>(null);
    const markersRef = useRef<L.Marker[]>([]);

    useEffect(() => {
        if (!mapRef.current) {
            mapRef.current = L.map('map', {
                center: [28.0339, 1.6596],
                zoom: zoom,
                zoomControl: false,
            });

            // Set the background color to dark blue
            mapRef.current.getContainer().style.background = '#020818';

            // Add the GeoJSON layer for Algeria
            const algeriaLayer = L.geoJSON(algeriaWilayas as GeoJSON.GeoJSON, {
                // Type assertion to GeoJSON
                style: {
                    fillColor: '#2fb96c', // Green Algeria fill
                    weight: 1, // Border thickness
                    color: '#2fb96c', // Border color
                    fillOpacity: 0.4, // Adjust as needed
                },
            }).addTo(mapRef.current);

            mapRef.current.fitBounds(algeriaLayer.getBounds()); // Zoom to Algeria

            mapRef.current.on('zoomend', () => {
                if (mapRef.current) {
                    onZoom(mapRef.current.getZoom());
                }
            });
        }

        updateMarkers();

        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        updateMarkers();
    }, [zoom, searchQuery]);

    const updateMarkers = () => {
        if (!mapRef.current) return;

        markersRef.current.forEach((marker) => marker.remove());
        markersRef.current = [];

        const bounds = mapRef.current.getBounds();
        const visibleMarkers: [number, number][] = [];

        const numMarkers = Math.min(1500, Math.round(zoom * zoom * 10));
        for (let i = 0; i < numMarkers; i++) {
            const lat = getRandomLat(zoom);
            const lng = getRandomLng(zoom);

            if (visibleMarkers.find((e) => e[0] === lat && e[1] === lng)) continue;

            if (bounds.contains([lat, lng])) {
                visibleMarkers.push([lat, lng]);
            }
        }

        const markers = L.markerClusterGroup();

        visibleMarkers.forEach(([lat, lng]) => {
            const locationId = generateLocationId(lat, lng);
            const marker = L.marker([lat, lng], {
                icon: L.divIcon({
                    className: 'custom-marker',
                    html: `<div style="background-color: #2fb96c; width: 6px; height: 6px; border-radius: 50%;"></div>`, // Neon Green Markers
                    iconSize: [6, 6],
                    iconAnchor: [3, 3],
                }),
            });

            marker.on('click', () => onLocationClick(locationId));
            markers.addLayer(marker);
            markersRef.current.push(marker);
        });

        mapRef.current.addLayer(markers);
    };

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

    return <div id="map" style={{ height: '100%', width: '100%' }}></div>;
};

export default AlgeriaMap;