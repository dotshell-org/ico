import React, { useState } from 'react';
import { Window } from '../../../types/nav/Window.ts';
import { useTranslation } from 'react-i18next';

interface NavItemProps {
    window: Window;
    selectedWindow: Window;
    setSelectedWindow: (window: Window) => void;
}

const windowColors: { [key in Window]: string } = {
    [Window.Accounting]: 'bg-red-500 hover:bg-red-400',
    [Window.Stock]: 'bg-green-500 hover:bg-green-400',
    [Window.Sales]: 'bg-blue-500 hover:bg-blue-400',
    [Window.Cafeteria]: 'bg-yellow-500 hover:bg-yellow-400',
};

const windowEmojis: { [key in Window]: string } = {
    [Window.Accounting]: '💰 ',
    [Window.Stock]: '📦 ',
    [Window.Sales]: '🛒 ',
    [Window.Cafeteria]: '☕ ',
}

const windowStrings: { [key in Window]: string } = {
    [Window.Accounting]: 'accounting',
    [Window.Stock]: 'stock',
    [Window.Sales]: 'sales',
    [Window.Cafeteria]: 'cafeteria',
};

const NavItem: React.FC<NavItemProps> = ({ selectedWindow, setSelectedWindow }) => {
    const { t }: { t: (key: string) => string } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const handleSelect = (newWindow: Window) => {
        setSelectedWindow(newWindow);
        setIsOpen(false);
    };

    const color = windowColors[selectedWindow];

    return (
        <div className="relative inline-block text-left">
            <button
                onClick={handleButtonClick}
                className={`${color} border-none text-white w-56 px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-between`}
            >
                {windowEmojis[selectedWindow]} {t(windowStrings[selectedWindow])}
                <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                    ></path>
                </svg>
            </button>
            {isOpen && (
                <div className="absolute mt-2 w-full shadow-lg bg-white rounded-md dark:bg-gray-800 dark:ring-1 dark:ring-gray-600">
                    <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu" className="rounded-md overflow-hidden w-full">
                        {Object.keys(Window).map((key) => (
                            <button
                                key={key}
                                onClick={() => handleSelect(Window[key as keyof typeof Window])}
                                className="block p-3 text-sm text-gray-700 bg-white hover:bg-gray-100 w-full text-left border-none transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
                                role="menuitem"
                            >
                                {windowEmojis[Window[key as keyof typeof Window]]} {t(windowStrings[Window[key as keyof typeof Window]])}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavItem;