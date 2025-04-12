// src/components/info-container.tsx (adjust path as needed)
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin as WilayaIcon, AlertTriangle, CheckCircle, Zap, Users, Hash } from 'lucide-react'; // Using specific icons for status

// Define LocationData interface directly in this file
interface LocationData {
    id: string;
    name: string;
    wilaya: string;
    latitude: number;
    longitude: number;
    status: 'normal' | 'warning' | 'alert';
    workers: number;
    powerConsumption: number;
}

interface InfoContainerProps {
    data: LocationData | null; // Can be null if nothing selected
    onClear: () => void;      // Callback to clear selection in parent
}

// Helper to get status display properties
const getStatusDisplay = (status: 'normal' | 'warning' | 'alert') => {
    switch (status) {
        case 'alert':
            return { text: 'Alert', color: 'text-red-500', Icon: AlertTriangle };
        case 'warning':
            return { text: 'Warning', color: 'text-yellow-500', Icon: AlertTriangle };
        case 'normal':
        default:
            return { text: 'Normal', color: 'text-green-500', Icon: CheckCircle };
    }
};

// Extract latitude and longitude from the data.id string
const extractLatLongFromId = (id) => {
    const parts = id.split('_');
    if (parts.length === 3) {
        const latitude = parseFloat(parts[1]);
        const longitude = parseFloat(parts[2]);
        return { latitude, longitude };
    }
    return { latitude: null, longitude: null };
};

const InfoContainer: React.FC<InfoContainerProps> = ({ data, onClear }) => {
    if (!data) {
        return null; // Don't render if no data
    }

    const { text: statusText, color: statusColor, Icon: StatusIcon } = getStatusDisplay(data.status);

    // Use the extracted latitude and longitude for display
    const { latitude, longitude } = extractLatLongFromId(data.id);

    return (
        <Card className="bg-card border-border relative shadow-lg animate-fade-in"> {/* Add subtle animation */}
            <CardHeader className="pb-2 pt-3 pr-10"> {/* Adjust padding */}
                <CardTitle className="text-xs font-semibold text-card-foreground leading-tight" title={data.name}>
                    {/* Truncate long names if necessary */}
                    {data.name.length > 40 ? `${data.name.substring(0, 37)}...` : data.name}
                </CardTitle>
                {/* Close button positioned top-right */}
                <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-1.5 right-1.5 h-7 w-7 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full"
                    onClick={onClear}
                    aria-label="Close details panel"
                >
                    <X size={16} />
                </Button>
            </CardHeader>
            <CardContent className="text-xs text-muted-foreground space-y-1.5 pt-1 pb-3"> {/* Adjusted padding/spacing */}
                {/* Wilaya */}
                <div className="flex items-center space-x-2">
                    <WilayaIcon size={12} className="text-primary flex-shrink-0" />
                    <p><strong className="text-foreground font-medium">Wilaya:</strong> {data.wilaya || 'N/A'}</p>
                </div>

                {/* Latitude */}
                <div className="flex items-center space-x-2">
                    <Hash size={12} className="text-primary flex-shrink-0" />
                    <p><strong className="text-foreground font-medium">Latitude:</strong> {latitude !== null ? latitude.toFixed(4) : 'N/A'}</p>
                </div>

                {/* Longitude */}
                <div className="flex items-center space-x-2">
                    <Hash size={12} className="text-primary flex-shrink-0" />
                    <p><strong className="text-foreground font-medium">Longitude:</strong> {longitude !== null ? longitude.toFixed(4) : 'N/A'}</p>
                </div>

                {/* Status */}
                <div className="flex items-center space-x-2">
                    <StatusIcon size={12} className={`${statusColor} flex-shrink-0`} />
                    <p><strong className="text-foreground font-medium">Status:</strong> <span className={statusColor}>{statusText}</span></p>
                </div>

                {/* Workers */}
                {/* <div className="flex items-center space-x-2">
                    <Users size={12} className="opacity-80 flex-shrink-0"/>
                    <p><strong className="text-foreground font-medium">Workers:</strong> {data.workers}</p>
                </div> */}


                {/* Optional: Display ID */}
                <div className="flex items-center space-x-2 pt-1 opacity-70">
                    <p className="text-[10px] truncate" title={data.id}><strong>ID:</strong> <span className={statusColor}>{data.id}</span></p>
                </div>

                {/* Optional: Display Lat/Lng if needed */}
                {/* <div className="flex items-center space-x-2 pt-1 opacity-70 text-xs">
                    <p>Lat: {data.latitude.toFixed(5)}</p>
                    <p>Lng: {data.longitude.toFixed(5)}</p>
                 </div> */}
            </CardContent>
        </Card>
    );
};

// Basic fade-in animation (add to your global CSS or Tailwind config)
/*
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}
*/

export default InfoContainer;