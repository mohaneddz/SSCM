import { useState } from 'react';
import ControlCard from '@/components/control-card';
import { DoorClosed, Blinds, ThermometerSun, Lightbulb, AlertCircle, Fan, ChevronUp, ChevronDown } from 'lucide-react';
import type { ControlCardProps } from '@/components/control-card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function Control() {

    const [acLevel, setAcLevel] = useState(40);
    const [server, setServer] = useState("ON");

    // spawn a shadCN toast for the server status
    const handleShutdown = () => {
        setTimeout(() => {
            setServer("OFF");
            toast("Server is shutting down", {
                description: "Please wait for the server to shutdown",
                duration: 3000,
                icon: <AlertCircle />,
                position: "top-right",
                className: "bg-red-500 text-white",
            });
        }, 3000);
    };

    const handleRestart = () => {
        toast("Server is restarting", {
            description: "Server will be back online shortly",
            duration: 3000,
            icon: <AlertCircle />,
            position: "top-right",
            className: "bg-yellow-500 text-white",
        });
        
        setTimeout(() => {
            setServer("OFF");
            toast("Server is shutting down", {
                description: "Please wait for the server to restart",
                duration: 3000,
                icon: <AlertCircle />,
                position: "top-right",
                className: "bg-red-500 text-white",
            });
        }, 3000);
        
        setTimeout(() => {
            setServer("ON");
            toast("Server is back online", {
                description: "Server has been successfully restarted",
                duration: 3000,
                icon: <AlertCircle />,
                position: "top-right",
                className: "bg-green-500 text-white",
            });
        }, 7000);
    };


    const handleBackup = () => {
        setServer("ON");
    };

    const handleAcIncrease = () => {
        if (acLevel < 100) setAcLevel(prev => Math.min(100, prev + 5));
    };

    const handleAcDecrease = () => {
        if (acLevel > 0) setAcLevel(prev => Math.max(0, prev - 5));
    };

    return (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-[65rem] mx-auto">
                <ControlCard
                    title="Door System"
                    type={1}
                    status={`Active`}
                    image="/control/door.png"
                />
                <ControlCard
                    title="Curtains"
                    type={1}
                    status={`Disabled`}
                    image="/control/curtains.png"
                />
                <ControlCard
                    title="Air Conditioning"
                    type={2}
                    status={`Disabled`}
                    image="/control/air-conditionair.png"
                />

                <ControlCard
                    title="Lighting"
                    type={3}
                    status={`Controls`}
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-around items-center gap-16 backdrop-blur-lg py-4 px-12 border border-gray-800 rounded-lg">
                            {
                                Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <Image src="/control/lamp1.png" alt="lamp" width={50} height={50} />
                                        {/* random ono or off */}
                                        <div className="flex flex-col gap-2 text-center text-white">{Math.random() > 0.5 ? 'ON' : 'OFF'}</div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </ControlCard>
                <ControlCard
                    title="Distinguisher"
                    type={1}
                    status={`Disabled`}
                    image="/control/Distinguisher.png"
                />

                <ControlCard
                    title="Server"
                    type={3}
                    status={`Controls`}
                    image="/control/Unknown.png"
                >
                    {/* variety of options ( for shutdown, restart, backup, etc.) */}
                    <div className="flex justify-around items-center gap-16 backdrop-blur-lg py-4 px-12 border border-gray-800 rounded-lg">
                        <div className="flex flex-col gap-2 items-center truncate">
                            <Image src="/control/shutdown.png" alt="shutdown" width={50} height={50} />
                            <Button onClick={handleShutdown}>Shutdown</Button>
                        </div>
                        <div className="flex flex-col gap-2 items-center truncate">
                            <Image src="/control/restart.png" alt="restart" width={50} height={50} />
                            <Button onClick={handleRestart}>Restart</Button>
                        </div>
                        <div className="flex flex-col gap-2 items-center truncate ">
                            <Image src="/control/backup.png" alt="backup" width={50} height={50} />
                            <Button onClick={handleBackup}>Backup</Button>
                        </div>
                    </div>
                </ControlCard>

            </div>
    );
}
