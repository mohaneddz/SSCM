// import React, { useState, useEffect } from 'react';
// import SearchInput from '@/components/search-input';
// import AlgeriaMap from '@/components/algeria-map';
// import InfoContainer from '@/components/info-container';
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
// import { useTheme } from 'next-themes';

// interface LocationData {
//     id: string;
//     name: string;
//     latitude: number;
//     longitude: number;
//     workers: number;
//     powerConsumption: number;
//     [key: string]: any;
// }

// const MapWithInfo: React.FC = () => {
//     const [searchQuery, setSearchQuery] = useState<string>('');
//     const [zoomLevel, setZoomLevel] = useState<number>(6);
//     const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
//     const [locationData, setLocationData] = useState<LocationData | null>(null);
//     const { theme } = useTheme();
//     const isDark = theme === 'dark';

//     useEffect(() => {
//         if (selectedLocationId) {
//             const fakeData = generateLocationData(selectedLocationId);
//             setLocationData(fakeData);
//         } else {
//             setLocationData(null);
//         }
//     }, [selectedLocationId]);

//     const handleSearch = (query: string) => {
//         setSearchQuery(query);
//     };

//     const handleMapZoom = (zoom: number) => {
//         setZoomLevel(zoom);
//     };

//     const handleLocationClick = (locationId: string) => {
//         setSelectedLocationId(locationId);
//     };

//     return (
//         <div className="flex flex-col h-full w-full p-4 space-y-4 bg-[#020818] text-white"> {/* Dark Blue Background */}
//             <SearchInput onSearch={handleSearch} />
//             <div className="flex flex-1 space-x-4">
//                 <div className="w-2/3 rounded-md overflow-hidden">
//                     <AlgeriaMap
//                         zoom={zoomLevel}
//                         onZoom={handleMapZoom}
//                         onLocationClick={handleLocationClick}
//                         searchQuery={searchQuery}
//                     />
//                 </div>
//                 <div className="w-1/3">
//                     {locationData ? (
//                         <InfoContainer data={locationData} />
//                     ) : (
//                         <Card className={`border ${isDark ? 'border-neutral-700' : 'border-neutral-200'} bg-transparent`}>
//                             <CardHeader>
//                                 <CardTitle className="text-sm font-medium">Select a Location</CardTitle>
//                             </CardHeader>
//                             <CardContent className="text-sm text-muted-foreground">
//                                 Click on a pin on the map to view details.
//                             </CardContent>
//                         </Card>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default MapWithInfo;

// const generateLocationData = (locationId: string): LocationData => {
//     const [_, lat, lng] = locationId.split('_');
//     const latitude = parseFloat(lat);
//     const longitude = parseFloat(lng);

//     return {
//         id: locationId,
//         name: `Mobilis Data Center ${locationId}`,
//         latitude: latitude,
//         longitude: longitude,
//         workers: Math.floor(Math.random() * 200) + 50,
//         powerConsumption: (Math.random() * 10) + 2,
//     };
// };

export default function Map () {
  return (
    <div>
      Map Component
    </div>
  );
};
