"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePageContext } from "./layout";
import { IconLoader } from "@tabler/icons-react";

const Home = dynamic(() => import("@/pages/Home"));
const Access = dynamic(() => import("@/pages/Access"));
const Health = dynamic(() => import("@/pages/Health"));
const Logs = dynamic(() => import("@/pages/Logs"));
const Simulation = dynamic(() => import("@/pages/Simulation"));
const Settings = dynamic(() => import("@/pages/Settings"));
const Control = dynamic(() => import("@/pages/Control"));
const Map = dynamic(() => import("@/pages/Map"));
const Power = dynamic(() => import("@/pages/Power"));
const Wheather = dynamic(() => import("@/pages/Wheather"));
const Server = dynamic(() => import("@/pages/Server"));
const Surveillance = dynamic(() => import("@/pages/Surveillance"));

export default function Page() {

    const { page }: any = usePageContext();

    const pages: any = {
        dashboard: Home,
        access: Access,
        Health: Health,
        logs: Logs,
        simulation: Simulation,
        settings: Settings,
        control: Control,
        map: Map,
        power: Power,
        weather: Wheather,
        server: Server,
        surveillance: Surveillance,
    };

    const PageComponent: React.ComponentType = pages[page] || Home;

    return (

        <div className="w-full h-full ">
            <Suspense fallback={
                // loading animation
                <div className="flex items-center justify-center w-full h-full">
                    <IconLoader className="animate-spin" size={30} color="#64748b" />
                </div>
            }>
                <PageComponent />
            </Suspense>
        </div>

    );
}
