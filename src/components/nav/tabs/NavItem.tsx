import React from 'react';

interface NavItemProps {
    href: string;
    text: string;
    active?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ href, text, active }) => {
    return (
        <label className={`rounded-md px-3 py-2 text-sm font-medium transition-all cursor-pointer ${active ? 'bg-gray-900 text-white' : 'text-gray-800 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white'}`} aria-current={active ? 'page' : undefined}>
            {text}
        </label>
    );
};

export default NavItem;