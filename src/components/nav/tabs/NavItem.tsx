import React from 'react';

interface NavItemProps {
    href: string;
    text: string;
    active?: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ text, active, onClick }) => {
    return (
        <label
            onClick={onClick}
            className={`z-10 rounded-md mx-1 px-3 py-2 text-sm font-medium transition-all cursor-pointer ${active ? 'ring-1 ring-gray-300 bg-gray-200 dark:ring-gray-600 dark:bg-gray-700' : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'}`}
            aria-current={active ? 'page' : undefined}
        >
            {text}
        </label>
    );
};

export default NavItem;