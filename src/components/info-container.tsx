// src/components/info-container.tsx (adjust path as needed)
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, MapPin as WilayaIcon, AlertTriangle, CheckCircle, Zap, Users, Hash } from 'lucide-react'; // Using specific icons for status
import { LocationData } from './MapWithInfo'; // Adjust import path

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

const InfoContainer: React.FC<InfoContainerProps> = ({ data, onClear }) => {
    if (!data) {
        return null; // Don't render if no data
    }

    const { text: statusText, color: statusColor, Icon: StatusIcon } = getStatusDisplay(data.status);

    return (
        <Card className="bg-card border-border relative shadow-lg animate-fade-in"> {/* Add subtle animation */}
            <CardHeader className="pb-2 pt-3 pr-10"> {/* Adjust padding */}
                <CardTitle className="text-base font-semibold text-card-foreground leading-tight" title={data.name}>
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
            <CardContent className="text-sm text-muted-foreground space-y-1.5 pt-1 pb-3"> {/* Adjusted padding/spacing */}
                {/* Wilaya */}
                 <div className="flex items-center space-x-2">
                     <WilayaIcon size={14} className="text-primary flex-shrink-0" />
                     <p><strong className="text-foreground font-medium">Wilaya:</strong> {data.wilaya || 'N/A'}</p>
                 </div>

                 {/* Status */}
                 <div className="flex items-center space-x-2">
                     <StatusIcon size={14} className={`${statusColor} flex-shrink-0`} />
                     <p><strong className="text-foreground font-medium">Status:</strong> <span className={statusColor}>{statusText}</span></p>
                 </div>

                 {/* Workers */}
                <div className="flex items-center space-x-2">
                    <Users size={14} className="opacity-80 flex-shrink-0"/>
                    <p><strong className="text-foreground font-medium">Workers:</strong> {data.workers}</p>
                </div>
                 {/* Power Consumption */}
                 <div className="flex items-center space-x-2">
                    <Zap size={14} className="opacity-80 flex-shrink-0"/>
                    <p><strong className="text-foreground font-medium">Power:</strong> {data.powerConsumption.toFixed(2)} MW</p> {/* Format number */}
                </div>

                 {/* Optional: Display ID */}
                 <div className="flex items-center space-x-2 pt-1 opacity-70">
                     <Hash size={14} className="flex-shrink-0"/>
                     <p className="text-xs truncate" title={data.id}>ID: {data.id}</p>
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