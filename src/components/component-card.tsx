import Image from 'next/image';
import { cn } from '@/lib/utils/cn';

export default function ComponentCard({ title, image, model, health, estimateTime }: { title: string, image: string, model: string, health?: number, estimateTime?: string }) {
    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 0.5);

    const twoYearsFromNow = new Date();
    twoYearsFromNow.setFullYear(twoYearsFromNow.getFullYear() + 1);

    const estimateDate = estimateTime ? new Date(estimateTime) : null;

    const getHealthStatus = (health?: number) => {
        if (health === undefined) return { text: "Unknown", color: "text-gray-500" };
        if (health > 75) return { olor: "text-green-500" };
        if (health > 35) return { color: "text-amber-600" };
        return { text: "Low", color: "text-red-500" };
    };

    const getValidityStatus = (date: Date | null) => {
        if (!date) return { text: "Unknown", color: "text-gray-500" };
        if (date > twoYearsFromNow) return { color: "text-green-500" };
        if (date > oneYearFromNow) return { color: "text-amber-500" };
        return { text: "Critical", color: "text-red-500" };
    };

    const healthStatus = getHealthStatus(health);
    const validityStatus = getValidityStatus(estimateDate);
    
    // Determine the gradient colors based on health
    const isLowHealth = health !== undefined && health < 60;

    return (
        <div className={cn(
            "w-full border max-h-36 max-w-80 overflow-hidden rounded-lg shadow-lg bg-gradient-to-tr",
            isLowHealth 
                ? "from-bad via-bad/10 via-40% to-bad/5 border-bad/40"
                : "from-primary via-primary/10 via-40% to-primary/5 border-gray-800",
            "hover:shadow-xl hover:cursor-pointer hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out"
        )}>

            <div className="flex gap-4 py-2 pt-0 h-full w-full max-h-36 justify-between items-center text-center text-white overflow-y-hidden">

                <Image src={image} alt={title} width={100} height={100} className="-bottom-8 -left-3 scale-110 rotate-45 relative w-min" />

                <div className="flex flex-col gap-1 p-4 py-2 h-full w-max justify-center items-center text-center">

                    <h2 className="text-lg font-bold text-foreground dark:text-white">{title}</h2>

                    <p className="text-sm text-muted-foreground dark:text-gray-400">{model}</p>
                    <p className="text-sm text-foreground dark:text-white">State: <span className={healthStatus.color}>{health}% {healthStatus.text}</span></p>
                    <p className="text-sm text-foreground dark:text-white">Valid Until: <span className={validityStatus.color}>{estimateTime}</span></p>

                </div>

            </div>
        </div>
    );
};