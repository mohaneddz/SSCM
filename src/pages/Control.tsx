'use client';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';
import ControlCard from '@/components/control-card';
import { IconDoor, IconWindow, IconTemperature, IconBulb, IconAlertCircle, IconCircleCheck, IconWind, IconChevronUp, IconChevronDown, IconPower, IconRefresh, IconDatabase } from '@tabler/icons-react';
import type { ControlCardProps } from '@/components/control-card';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Toaster } from 'sonner';

export default function Control() {

    const [acLevel, setAcLevel] = useState(0);
    const [server, setServer] = useState("ON");
    const [lampStatus, setLampStatus] = useState<{ [key: number]: boolean }>({});
    const [doorStatus, setDoorStatus] = useState("Disabled");
    const [curtainsStatus, setCurtainsStatus] = useState("Disabled");
    const [distinguisherStatus, setDistinguisherStatus] = useState("Disabled");

    const handleLamp = (index: number) => {
        setLampStatus(prev => ({ ...prev, [index]: !prev[index] }));
    };

    // spawn a shadCN toast for the server status
    const handleShutdown = () => {
        setTimeout(() => {
            setServer("OFF");
            toast("Server is shutting down", {
                description: "Please wait for the server to shutdown",
                duration: 3000,
                icon: <IconAlertCircle />,
                position: "top-right",
                className: "bg-red-500 text-white",
            });
        }, 1000);
    };

    const handleRestart = () => {
        console.log("Restarting server");
        toast("Server is restarting", {
            description: "Server will be back online shortly",
            duration: 3000,
            icon: <IconAlertCircle />,
            position: "top-right",
            className: "bg-yellow-500 text-white",
        });

        setTimeout(() => {
            setServer("OFF");
            toast("Server is shutting down", {
                description: "Please wait for the server to restart",
                duration: 3000,
                icon: <IconAlertCircle />,
                position: "top-right",
                className: "bg-red-500 text-white",
            });
        }, 1000);

        setTimeout(() => {
            setServer("ON");
            toast("Server is back online", {
                description: "Server has been successfully restarted",
                duration: 3000,
                icon: <IconAlertCircle />,
                position: "top-right",
                className: "bg-green-500 text-white",
            });
        }, 7000);
    };

    const handleBackup = () => {
        toast("Backup is being created", {
            description: "Please wait for the backup to be created",
            duration: 3000,
            icon: <IconAlertCircle />,
            position: "top-right",
            className: "bg-blue-500 text-white",
        });

        setTimeout(() => {
            toast("Backup is created", {
                description: "Backup has been successfully created",
                duration: 3000,
                icon: <IconCircleCheck />,
                position: "top-right",
                className: "bg-green-500 text-white",
            });
        }, 7000);
    };

    const handleAcIncrease = () => {
        if (acLevel < 3) setAcLevel(prev => prev + 1);
    };

    const handleAcDecrease = () => {
        if (acLevel > 0) setAcLevel(prev => prev - 1);
    };

    const toggleStatus = (status: string, setStatus: (value: string) => void) => {
        setStatus(status === "Active" ? "Disabled" : "Active");
    };

    return (
        <div className="flex justify-center items-center h-full mt-8">
            <Toaster position="top-right" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 max-w-[50rem] mx-auto">
                <ControlCard
                    title="Door System"
                    type={1}
                    status={doorStatus}
                    image="/control/door.png"
                    onClick={() => toggleStatus(doorStatus, setDoorStatus)}
                />
                <ControlCard
                    title="Curtains"
                    type={1}
                    status={curtainsStatus}
                    image="/control/curtains.png"
                    onClick={() => toggleStatus(curtainsStatus, setCurtainsStatus)}
                />
                <ControlCard
                    title="Air Conditioning"
                    type={2}
                    status={acLevel === 0 ? "Disabled" : "Active"}
                    image="/control/air-conditionair.png"
                >
                    <div className="flex flex-col items-center gap-4">
                        <h3 className="text-sm xs:text-base sm:text-lg lg:text-2xl mb-1 sm:mb-2 font-bold text-black dark:text-white truncate">Level</h3>
                        <div className="flex gap-2">
                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-3 h-3 rounded-full ${i < acLevel ? 'bg-green-500' : 'bg-gray-600'}`}
                                />
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <button
                                onClick={handleAcDecrease}
                                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                                disabled={acLevel === 0}
                            >
                                <IconChevronDown size={10} />
                            </button>
                            <button
                                onClick={handleAcIncrease}
                                className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                                disabled={acLevel === 3}
                            >
                                <IconChevronUp size={10} />
                            </button>
                        </div>
                    </div>
                </ControlCard>

                <ControlCard
                    title="Lighting"
                    type={3}
                    status={`Controls`}
                >
                    <div className="flex flex-col gap-2">
                        <div className="flex justify-around items-center gap-8 backdrop-blur-lg py-4 px-12 border border-gray-800 rounded-lg">
                            {
                                Array.from({ length: 5 }).map((_, index) => (
                                    <div key={index} className="flex flex-col gap-2">
                                        <Image
                                            src={`/control/lamp${index + 1}.png`}
                                            alt="lamp"
                                            width={50}
                                            height={50}
                                            onClick={() => handleLamp(index)}
                                            className="cursor-pointer hover:opacity-80 transition-opacity"
                                        />
                                        <div className={`flex flex-col gap-2 text-center font-bold ${lampStatus[index] ? 'text-slate-400' : 'text-bad'}`}>
                                            {lampStatus[index] ? 'ON' : 'OFF'}
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </ControlCard>

                <ControlCard
                    title="Distinguisher"
                    type={1}
                    status={distinguisherStatus}
                    image="/control/Distinguisher.png"
                    onClick={() => toggleStatus(distinguisherStatus, setDistinguisherStatus)}
                />

                <ControlCard
                    title="Server"
                    type={3}
                    status={`Controls`}
                >
                    <div className="flex justify-around items-center gap-16 backdrop-blur-lg py-4 px-12 border border-gray-800 rounded-lg">
                        <div className="flex flex-col gap-2 items-center truncate" >
                            <IconPower 
                                size={40} 
                                className="text-black dark:text-white hover:text-red-500 transition-colors cursor-pointer" 
                            />
                            <Button onClick={handleShutdown} className="hover:cursor-pointer hover:brightness-70 hover:scale-105 transition-all duration-300">Shutdown</Button>
                        </div>
                        <div className="flex flex-col gap-2 items-center truncate" >
                            <IconRefresh 
                                size={40} 
                                className="text-black dark:text-white hover:text-yellow-500 transition-colors cursor-pointer" 
                            />
                            <Button onClick={handleRestart} className="hover:cursor-pointer hover:brightness-70 hover:scale-105 transition-all duration-300">Restart</Button>
                        </div>
                        <div className="flex flex-col gap-2 items-center truncate">
                            <IconDatabase 
                                size={40} 
                                className="text-black dark:text-white hover:text-blue-500 transition-colors cursor-pointer" 
                                
                            />
                            <Button onClick={handleBackup} className="hover:cursor-pointer hover:brightness-70 hover:scale-105 transition-all duration-300">Backup</Button>
                        </div>
                    </div>
                </ControlCard>
            </div>
        </div>
    );
}