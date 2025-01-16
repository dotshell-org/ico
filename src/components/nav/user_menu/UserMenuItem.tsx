import React from 'react';

interface UserMenuItemProps {
    text: string;
}

const UserMenuItem: React.FC<UserMenuItemProps> = ({ text }) => {
    return (
        <button
            className="block py-2 pl-2 text-sm text-gray-700 bg-white hover:bg-gray-100 w-full text-left border-none transition-all dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-white"
            role="menuitem"
        >
            { text }
        </button>
    );
};

export default UserMenuItem;