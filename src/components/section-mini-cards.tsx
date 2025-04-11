import { IconWindow, IconAirConditioning, IconBulbFilled, IconDoor } from "@tabler/icons-react"

import MiniCard from "@/components/min-card";

export default function SectionMiniCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 my-8 ">
            <MiniCard
                icon={IconAirConditioning}
                title="Airc Conditioning"
                value1="Cooling"
                value2="40%"
            />
            <MiniCard
                icon={IconBulbFilled}
                title="Lights"
                value1="Active"
                value2="8 | Lamps"
            />
            <MiniCard
                icon={IconWindow}
                title="Curtains"
                value1="Open"
                value2="50%"
            />
            <MiniCard
                icon={IconDoor}
                title="Door"
                value1="Closed"
                value2="Locked"
                iconColor="text-red-500"
            />
        </div>
    );
}