import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';
import { Separator } from '@/components/ui/separator';
// type 1 : square 
// type 2 : rectangle vertical 
// type 3 : rectangle horizontal 
export interface ControlCardProps {
    title: string;
    type: 1 | 2 | 3; // 1: square, 2: rectangle vertical, 3: rectangle horizontal
    status: string;
    image?: string;
    className?: string;
    children?: React.ReactNode;
    onStatusChange?: () => void;
    onClick?: () => void;
}

const ControlCard = ({
    title,
    type,
    status,
    image,
    className,
    children,
    onStatusChange,
    onClick
}: ControlCardProps) => {
    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active':
            case 'on':
                return 'primary';
            case 'open':
                return 'blue-700';
            case 'disabled':
            case 'off':
                return 'bad';
            default:
                return 'neutral';
        }
    };

    const getStatusColorClass = (status: string) => {
        const baseColor = getStatusColor(status);
        if (baseColor === 'bad') {
            return `from-bad via-bad/10 via-40% to-bad/5`;
        } else if (baseColor === 'neutral') {
            return `from-neutral via-neutral/10 via-40% to-neutral/5`;
        } else if (baseColor === 'primary') {
            return `from-primary via-primary/10 via-40% to-primary/5`;
        }
        return `from-${baseColor} via-${baseColor}/10 via-40% to-${baseColor}/5`;
    };

    const getCardSize = () => {
        switch (type) {
            case 1: // Square
                return 'w-full ';
            case 2: // Vertical Rectangle
                return 'w-full row-span-2';
            case 3: // Horizontal Rectangle
                return 'w-full col-span-2 ';
            default:
                return 'w-full';
        }
    };

    const renderCardContent = () => {
        switch (type) {

            case 1: // Square - Image left, text right
                return (
                    <div className="flex h-full xs:flex-row hover:cursor-pointer">
                        {/* Left side - Image */}
                        <div className="flex items-center justify-center w-full">
                            <div className="rounded-xl flex items-center justify-center overflow-hidden p-1.5 sm:p-2 md:p-4 h-[70%] xs:h-[80%]">
                                {image && (
                                    <img
                                        src={image}
                                        alt={title}
                                        className="w-full h-auto object-contain max-h-[120px] xs:max-h-[140px] sm:max-h-[160px]"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Right side - Content */}
                        <div className="flex flex-col text-center justify-center content-center items-center h-full w-full p-1.5 sm:p-2 md:p-4 ">
                            <div>
                                <h3 className="text-sm xs:text-base sm:text-lg lg:text-2xl mb-1 sm:mb-2 font-bold text-black dark:text-white truncate">{title}</h3>
                                <p className={cn("text-xs xs:text-sm font-medium lg:text-md", `text-${getStatusColor(status)}`)}>
                                    {status}
                                </p>
                            </div>
                            {children}
                        </div>
                    </div>
                );

            case 2:
                return (
                    <div className="flex flex-col h-full">
                        {/* Top - Image */}
                        <div className="flex-shrink-0 p-1.5 sm:p-2 md:p-4">
                            <div className="w-full rounded-xl flex justify-center overflow-hidden">
                                {image && (
                                    <img
                                        src={image}
                                        alt={title}
                                        className="w-full h-auto object-contain max-h-[120px] xs:max-h-[140px] sm:max-h-[160px]"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Bottom - Content */}
                        <div className="flex-grow flex flex-col justify-center p-1.5 sm:p-2 md:p-4 pt-0 h-full gap-3 sm:gap-4 md:gap-8">

                            <div className="w-full flex flex-col justify-center lg:text-3xl items-center">
                                <h3 className="text-sm xs:text-base sm:text-lg lg:text-2xl font-bold text-black dark:text-white text-center">{title}</h3>
                                <p className={cn("text-xs xs:text-sm font-medium lg:text-md", getStatusColor(status))}>
                                    {status}
                                </p>
                            </div>

                            <Separator className="my-1 sm:my-2 w-[30%] mx-auto bg-gradient-to-r from-gray-200/5 via-gray-200/30 to-gray-200/5" />
                            {
                                children && (
                                    <div className="w-full flex flex-col justify-center lg:text-3xl items-center">
                                        {children}
                                    </div>
                                )
                            }
                        </div>
                    </div>
                );

            case 3: // Horizontal - Header top, content bottom
                return (
                    <div className="flex flex-col h-full">
                        {/* Top - Header */}
                        <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 p-1.5 sm:p-2 ">
                            <div className="w-full flex flex-col justify-center items-center">
                                <h3 className="text-sm xs:text-base sm:text-lg lg:text-3xl font-bold text-black dark:text-white text-center">{title}</h3>
                                <p className={cn("text-xs xs:text-sm font-medium", getStatusColor(status))}>
                                    {status}
                                </p>
                            </div>
                        </div>
                        {/* Bottom - Content */}
                        <div className="flex-grow flex items-center justify-center p-1.5 sm:p-2 md:p-4">
                            {children}
                        </div>
                    </div>
                );
        }
    };

    // for type 1 : to tr, t2 : to t, t3 : to t

    return (
        <div 
            className={cn(
                `border border-gray-800 overflow-hidden rounded-lg shadow-lg text-gray-400`,
                type === 1 ? `bg-gradient-to-tr` : type === 2 ? `bg-gradient-to-b` : `bg-gradient-to-t`,
                getStatusColorClass(status === 'Controls' ? 'Active' : status),
                `hover:shadow-xl hover:scale-105 hover:-translate-y-2 transition-all duration-300 ease-in-out`,
                getCardSize(),
                className
            )}
            onClick={onClick}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
        >
            {renderCardContent()}
        </div>
    );
};

export default ControlCard; 