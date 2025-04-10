"use client";

import React, { Suspense } from "react";
import dynamic from "next/dynamic";
import { usePageContext } from "./layout";
import { IconLoader } from "@tabler/icons-react";

const Home = dynamic(() => import("@/pages/Home"));
const Access = dynamic(() => import("@/pages/Access"));
const Warranties = dynamic(() => import("@/pages/Warranties"));
const Logs = dynamic(() => import("@/pages/Logs"));
const Simulation = dynamic(() => import("@/pages/Simulation"));
const Settings = dynamic(() => import("@/pages/Settings"));
const Inspections = dynamic(() => import("@/pages/Inspections"));

export default function Page() {

    const { page }: any = usePageContext();

    const pages: any = {
        dashboard: Home,
        access: Access,
        warranties: Warranties,
        logs: Logs,
        simulation: Simulation,
        settings: Settings,
        inspections: Inspections,
    };

    const PageComponent: React.ComponentType = pages[page] || Home;

    return (

        <div className="w-full h-full">
            <Suspense fallback={
                // loading animation
                <div className="flex h-full w-full justify-center items-center">
                    <IconLoader className="animate-spin" size={30} color="#000" />
                </div>
            }>
                <PageComponent />
            </Suspense>
        </div>

    );
}
