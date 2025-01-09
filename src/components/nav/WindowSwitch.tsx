import React, { useState } from 'react';
import { Window } from '../../types/Window';

interface NavItemProps {
    window: Window;
}

const windowColors: { [key in Window]: string } = {
    [Window.Accounting]: 'bg-red-500 hover:bg-red-400',
    [Window.Stock]: 'bg-green-500 hover:bg-green-400',
    [Window.Sales]: 'bg-blue-500 hover:bg-blue-400',
    [Window.SchoolCafetManager]: 'bg-yellow-500 hover:bg-yellow-400',
};

const NavItem: React.FC<NavItemProps> = ({ window }) => {
    const [selectedWindow, setSelectedWindow] = useState<Window>(window);
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
                className={`${color} border-none text-white w-48 px-3 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-between`}
            >
                {selectedWindow}
                <svg
                    className="w-4 h-4 ml-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
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
                <div className="absolute mt-2 w-48 shadow-lg bg-white rounded-md">
                    <div role="menu" aria-orientation="vertical" aria-labelledby="options-menu" className="rounded-md overflow-hidden w-44">
                        {Object.keys(Window).map((key) => (
                            <button
                                key={key}
                                onClick={() => handleSelect(Window[key as keyof typeof Window])}
                                className="block p-3 text-sm text-gray-700 bg-white hover:bg-gray-100 w-full text-left border-none transition-all"
                                role="menuitem"
                            >
                                {Window[key as keyof typeof Window]}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NavItem;