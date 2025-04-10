import React, { useState, useCallback } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from 'lucide-react';

interface SearchInputProps {
    onSearch: (query: string) => void;
}

const SearchInput: React.FC<SearchInputProps> = ({ onSearch }) => {
    const [inputValue, setInputValue] = useState<string>('');

    const debouncedSearch = useCallback(
        debounce((value: string) => {
            onSearch(value);
        }, 300),
        [onSearch]
    );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setInputValue(value);
        debouncedSearch(value);
    };

    return (
        <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <Input
                type="text"
                placeholder="Search locations..."
                value={inputValue}
                onChange={handleChange}
                className="pl-9 bg-gray-700 border border-gray-600 text-white rounded-md focus:outline-none focus:border-[#2fb96c] shadow-sm text-sm" // Neon Green Focus
            />
        </div>
    );
};

export default SearchInput;

function debounce(func: Function, delay: number) {
    let timeout: NodeJS.Timeout;
    return function (...args: any[]) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), delay);
    };
}