import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useTheme } from 'next-themes';

interface LocationData {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    workers: number;
    powerConsumption: number;
    [key: string]: any;
}

interface InfoContainerProps {
    data: LocationData;
}

const InfoContainer: React.FC<InfoContainerProps> = ({ data }) => {
    const { theme } = useTheme();
    const isDark = theme === 'dark';

    if (!data) {
        return null;
    }

    return (
        <Card className={`border ${isDark ? 'border-neutral-700' : 'border-neutral-200'} bg-gray-800 text-white`}> {/* Dark Card */}
            <CardHeader>
                <CardTitle className="text-sm font-medium">{data.name}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-400">
                <p>Latitude: {data.latitude}</p>
                <p>Longitude: {data.longitude}</p>
                <p>Workers: {data.workers}</p>
                <p>Power Consumption: {data.powerConsumption} MW</p>
            </CardContent>
        </Card>
    );
};

export default InfoContainer;