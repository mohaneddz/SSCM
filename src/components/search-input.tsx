import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Input } from "@/components/ui/input"; // Assuming Shadcn UI Input
import { Search, X, MapPin } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    // CommandInput, // Not strictly needed here as filtering is manual via useEffect
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from "@/components/ui/button"; // Using Shadcn UI Button for consistency

interface SearchInputProps {
    onSearch: (query: string) => void;
    onWilayaSelect?: (wilaya: string | null) => void; // Callback for Wilaya selection
    disabled?: boolean; // Optional prop to disable the component
}

// Algeria's 58 wilayas (provinces) - Ensure this list matches GeoJSON and population data keys
const ALGERIA_WILAYAS = [
    "Adrar", "Chlef", "Laghouat", "Oum El Bouaghi", "Batna", "Béjaïa", "Biskra", "Béchar",
    "Blida", "Bouira", "Tamanrasset", "Tébessa", "Tlemcen", "Tiaret", "Tizi Ouzou", "Alger",
    "Djelfa", "Jijel", "Sétif", "Saïda", "Skikda", "Sidi Bel Abbès", "Annaba", "Guelma",
    "Constantine", "Médéa", "Mostaganem", "M\'Sila", "Mascara", "Ouargla", "Oran", "El Bayadh",
    "Illizi", "Bordj Bou Arréridj", "Boumerdès", "El Tarf", "Tindouf", "Tissemsilt", "El Oued",
    "Khenchela", "Souk Ahras", "Tipaza", "Mila", "Aïn Defla", "Naâma", "Aïn Témouchent",
    "Ghardaïa", "Relizane", "Timimoun", "Bordj Badji Mokhtar", "Ouled Djellal", "Béni Abbès", // Added 2019 wilayas
    "In Salah", "In Guezzam", "Touggourt", "Djanet", "El M\'Ghair", "El Meniaa"
].sort(); // Sort alphabetically for better UX in the list

const SearchInput: React.FC<SearchInputProps> = ({ onSearch, onWilayaSelect, disabled = false }) => {
    const [inputValue, setInputValue] = useState<string>(''); // Controls the text visible in the input field
    const [commandInputValue, setCommandInputValue] = useState<string>(''); // State for filtering within Command *if* using CommandInput
    const [open, setOpen] = useState(false); // Popover open state for Wilaya mode
    const [isWilayaMode, setIsWilayaMode] = useState(false); // Toggle between Search and Wilaya Filter
    const [activeWilaya, setActiveWilaya] = useState<string | null>(null); // Track the selected Wilaya filter
    const inputRef = useRef<HTMLInputElement>(null); // Ref for focusing the input element

    // Debounce function
    const debounce = (func: Function, delay: number) => {
        let timeout: NodeJS.Timeout;
        return function (this: any, ...args: any[]) { // Ensure 'this' context is preserved if needed
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    };

    // Debounced search callback - only triggers onSearch when not in Wilaya mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            if (!isWilayaMode) { // Only call parent onSearch if in general search mode
                onSearch(value);
            }
        }, 300),
        [onSearch, isWilayaMode] // Recreate debounce function if mode changes
    );

    // Handle changes in the main Input component
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);

        // If in general search mode, trigger the debounced search
        if (!isWilayaMode) {
            debouncedSearch(value);
        } else {
            // If in Wilaya mode, update the command input value to filter the list
            setCommandInputValue(value); // Update filter text for Command list
            if (!open && value.length > 0) {
                setOpen(true); // Open popover automatically when typing in Wilaya mode
            } else if (open && value.length === 0) {
                // Optionally keep open or close when input is cleared
                // setOpen(false);
            }
        }
    };

    // Handle selecting a Wilaya from the Command list
    const handleWilayaSelectCommand = (wilaya: string) => {
        setActiveWilaya(wilaya); // Set the active Wilaya filter
        setInputValue(wilaya); // Update the input field to show the selected Wilaya
        setOpen(false);        // Close the popover
        setCommandInputValue(''); // Clear the Command's internal filter text
        if (onWilayaSelect) {
            onWilayaSelect(wilaya); // Notify parent about the selected Wilaya
        }
        onSearch('');          // Clear any general search query when a Wilaya filter is applied
    };

    // Clear current selection (either search query or Wilaya filter)
    const clearSelection = () => {
        setInputValue(''); // Clear input field text
        setCommandInputValue(''); // Clear Command filter text
        if (isWilayaMode) {
            if (activeWilaya !== null) { // Only notify if a wilaya *was* active
                setActiveWilaya(null); // Clear active wilaya state
                if (onWilayaSelect) {
                    onWilayaSelect(null); // Notify parent: Wilaya filter cleared
                }
            }
        } else {
            onSearch(''); // Notify parent: Search query cleared
        }
        inputRef.current?.focus(); // Refocus the input field
    };

    // Switch between Search and Wilaya Filter modes
    const switchMode = (newModeIsWilaya: boolean) => {
        if (isWilayaMode !== newModeIsWilaya) {
            setIsWilayaMode(newModeIsWilaya);
            // Clear all state when switching modes for a clean slate
            setInputValue('');
            setCommandInputValue('');
            setActiveWilaya(null);
            onSearch(''); // Clear search in parent
            if (onWilayaSelect) {
                onWilayaSelect(null); // Clear Wilaya filter in parent
            }
            setOpen(false); // Ensure popover is closed
            // Slightly delay focus to allow state update and re-render
            setTimeout(() => inputRef.current?.focus(), 0);
        }
    };

    // Filter Wilayas based on commandInputValue for the Command component
    const filteredWilayas = ALGERIA_WILAYAS.filter(wilaya =>
        wilaya.toLowerCase().includes(commandInputValue.toLowerCase())
    );

    return (
        <div className="w-full space-y-2">
            
            {/* Mode Switch Buttons using Shadcn UI Button */}
            <div className="flex items-center gap-2">
                <Button
                    variant={!isWilayaMode ? "default" : "outline"} // Use variant for visual active state
                    size="sm"
                    onClick={() => switchMode(false)}
                    className="transition-colors duration-150 ease-in-out"
                >
                    <Search size={14} className="mr-1" /> Search All
                </Button>
                {onWilayaSelect && ( // Only show Wilaya filter button if handler is provided
                    <Button
                        variant={isWilayaMode ? "default" : "outline"}
                        size="sm"
                        onClick={() => switchMode(true)}
                        className="transition-colors duration-150 ease-in-out"
                    >
                        <MapPin size={14} className="mr-1" /> Filter by Wilaya
                    </Button>
                )}
            </div>

            {/* Input Area */}
            <div className="relative">
                {isWilayaMode && onWilayaSelect ? (
                    // --- Wilaya Filter Mode ---
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <div className="relative flex items-center">
                                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground z-10 pointer-events-none" size={16} />
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Type or select Wilaya filter..."
                                    value={inputValue} // Shows selected wilaya or typed filter text
                                    onChange={handleInputChange} // Update filter text and open popover
                                    onFocus={() => !open && setOpen(true)} // Open popover on focus if not already open
                                    // onClick={() => !open && setOpen(true)} // Also open on click
                                    // Use Shadcn UI theme variables for styling
                                    className="pl-9 pr-8 w-full bg-background border-border text-foreground rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring text-sm h-10"
                                />
                                {/* Clear button appears only when a Wilaya is actively selected */}
                                {activeWilaya && (
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent popover toggle
                                            clearSelection();
                                        }}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                                        aria-label="Clear Wilaya filter"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                            {/* Using Command for the filterable list inside Popover */}
                            <Command shouldFilter={false} className="bg-popover"> {/* Disable internal filter, using our state */}
                                {/* Optional: Add CommandInput here if preferred over main Input for filtering */}
                                {/* <CommandInput
                    placeholder="Search wilaya..."
                    value={commandInputValue}
                    onValueChange={setCommandInputValue}
                    className="h-9 text-sm border-b border-border" // Example styling
                 /> */}
                                <CommandList>
                                    <CommandEmpty className="py-4 text-center text-sm text-muted-foreground">
                                        No wilayas found.
                                    </CommandEmpty>
                                    <CommandGroup heading="Wilayas" className="text-muted-foreground font-medium px-2 py-1.5 text-xs">
                                        {filteredWilayas.map((wilaya) => (
                                            <CommandItem
                                                key={wilaya}
                                                value={wilaya} // Value used for Command navigation/selection
                                                onSelect={() => handleWilayaSelectCommand(wilaya)}
                                                className={`text-sm cursor-pointer rounded-sm flex items-center space-x-2 aria-selected:bg-accent aria-selected:text-accent-foreground ${activeWilaya === wilaya ? 'font-semibold' : '' // Highlight active selection
                                                    }`}
                                            >
                                                {/* Icon optional or conditional */}
                                                {/* <MapPin className={`mr-2 h-4 w-4 ${activeWilaya === wilaya ? 'opacity-100' : 'opacity-50'}`} /> */}
                                                <span>{wilaya}</span>
                                            </CommandItem>
                                        ))}
                                    </CommandGroup>
                                </CommandList>
                            </Command>
                        </PopoverContent>
                    </Popover>
                ) : (
                    // --- General Search Mode ---
                    <div className="relative flex items-center">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none" size={16} />
                        <Input
                            ref={inputRef}
                            type="text"
                            placeholder="Search locations by ID, name..."
                            value={inputValue}
                            onChange={handleInputChange} // Use the handler that debounces
                            // Consistent styling using Shadcn UI theme variables
                            className="pl-9 pr-8 w-full bg-background border-border text-foreground rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shadow-sm text-sm h-10"
                        />
                        {/* Show clear button only if there's text in the input */}
                        {inputValue && (
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-muted"
                                aria-label="Clear search"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchInput;