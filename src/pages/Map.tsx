// src/components/MapWithInfo.tsx (or your main page component)
import React, { useState, useCallback } from 'react';
import SearchInput from '@/components/search-input'; // Adjust path
import AlgeriaMap from '@/components/algeria-map';   // Adjust path - ENSURE THIS IS THE POPULATION-BASED VERSION
import InfoContainer from '@/components/info-container'; // Adjust path
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from 'next-themes'; // Optional: for theme-based styling

// Define or import the LocationData interface
export interface LocationData {
    id: string;
    name: string;
    latitude: number; // Parsed or kept, decide if needed
    longitude: number; // Parsed or kept, decide if needed
    wilaya: string;
    status: 'normal' | 'warning' | 'alert';
    workers: number;
    powerConsumption: number;
}

// Helper function to generate mock data for the info panel
// Uses info passed from the map click (wilaya, status, id)
const generateLocationData = (locationId: string, wilaya: string, status: 'normal' | 'warning' | 'alert'): LocationData => {
    // Attempt to parse Lat/Lng from ID if needed for display, otherwise can ignore
    // Example ID format: MOB_ADR1_30.1234_-0.5678
    let latitude = 0;
    let longitude = 0;
    const parts = locationId.split('_');
    if (parts.length >= 4) {
        latitude = parseFloat(parts[parts.length - 2]);
        longitude = parseFloat(parts[parts.length - 1]);
    }

    // Create a more descriptive name
    const centerNumber = parts.length > 1 ? parts[1].replace(/\D/g, '') : 'Unknown'; // Extract number part
    const name = `Mobilis Center #${centerNumber} (${wilaya})`;

    return {
        id: locationId,
        name: name,
        latitude: isNaN(latitude) ? 0 : latitude, // Fallback if parsing fails
        longitude: isNaN(longitude) ? 0 : longitude, // Fallback if parsing fails
        wilaya: wilaya,
        status: status,
        // Keep example random data for workers and power
        workers: Math.floor(Math.random() * 180) + 20, // e.g., 20-200 workers
        powerConsumption: parseFloat(((Math.random() * 8) + 1.5).toFixed(2)), // e.g., 1.5 - 9.5 MW
    };
};


const MapWithInfo: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [zoomLevel, setZoomLevel] = useState<number>(6); // Initial zoom
    const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null); // Track selected marker ID
    const [locationData, setLocationData] = useState<LocationData | null>(null); // Data for InfoContainer
    const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null); // Track Wilaya filter

    const { theme } = useTheme(); // Optional theming
    const isDark = theme === 'dark'; // Example usage

    // Handler for text search input
    const handleSearch = useCallback((query: string) => {
        setSearchQuery(query);
        // Clear Wilaya filter and selection when doing a text search
        setSelectedWilaya(null);
        setSelectedLocationId(null);
        setLocationData(null);
    }, []);

    // Handler for Wilaya selection from SearchInput
    const handleWilayaSelect = useCallback((wilaya: string | null) => {
        setSelectedWilaya(wilaya);
        // Clear text search and selection when applying a Wilaya filter
        setSearchQuery('');
        setSelectedLocationId(null);
        setLocationData(null);
    }, []);

    // Handler for map zoom changes
    const handleMapZoom = useCallback((zoom: number) => {
        setZoomLevel(zoom);
    }, []);

    // Handler for clicking a marker on the map
    // Receives data directly from the map component
    const handleLocationClick = useCallback((locationId: string, wilaya: string, status: 'normal' | 'warning' | 'alert') => {
        setSelectedLocationId(locationId); // Set the ID of the clicked marker
        // Generate the detailed data object for the InfoContainer
        const newLocationData = generateLocationData(locationId, wilaya, status);
        setLocationData(newLocationData); // Update state to show the InfoContainer
    }, []);

    // Handler for clearing the selection (called by InfoContainer close button)
    const handleClearSelection = useCallback(() => {
        setSelectedLocationId(null); // Clear the selected ID
        setLocationData(null);      // Clear the data, hiding the InfoContainer
        // The map component will see selectedLocationId is null and reset the marker style
    }, []);

    return (
        // Main container - adjust padding, background etc. as needed
        <div className="flex flex-col h-screen w-full p-3 md:p-4 space-y-3 bg-background text-foreground overflow-hidden">
            {/* Search Input Component */}
            <div className="flex-shrink-0">
                <SearchInput
                    onSearch={handleSearch}
                    onWilayaSelect={handleWilayaSelect} // Pass the Wilaya handler
                />
            </div>

            {/* Info Container or Placeholder */}
            <div className="flex-shrink-0"> {/* Prevents info container from growing too large */}
                {locationData ? (
                    <InfoContainer data={locationData} onClear={handleClearSelection} />
                ) : (
                    // Placeholder when no location is selected
                    <Card className={`border ${isDark ? 'border-neutral-700' : 'border-neutral-300'} bg-card text-card-foreground shadow-sm`}>
                        <CardHeader className="p-3">
                            <CardTitle className="text-sm font-medium">Location Details</CardTitle>
                        </CardHeader>
                        <CardContent className="p-3 text-sm text-muted-foreground">
                            {selectedWilaya
                                ? `Filtering by Wilaya: ${selectedWilaya}. Click a pin for details.`
                                : "Click a pin on the map to view its details or apply a Wilaya filter."}
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Map Container - Takes remaining space */}
            <div className="flex-grow w-full min-h-0"> {/* min-h-0 prevents flexbox overflow issues */}
                <div className="w-full h-full rounded-md overflow-hidden border border-border shadow-md">
                    {/* Ensure the correct AlgeriaMap component is used */}
                    <AlgeriaMap
                        zoom={zoomLevel}
                        onZoom={handleMapZoom}
                        // @ts-ignore
                        onLocationClick={handleLocationClick} // Pass the updated handler
                        searchQuery={searchQuery}
                        selectedWilaya={selectedWilaya}       // Pass selected Wilaya state
                        selectedLocationId={selectedLocationId} // Pass selected ID for highlighting sync
                    />
                </div>
            </div>
        </div>
    );
};

export default MapWithInfo;