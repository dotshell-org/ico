import React, { useState, useRef } from 'react';
import noProfile from '/no-profile.svg';
import UserMenuItemsGroup from './UserMenuItemsGroup';
import { Tabs } from '../../../types/nav/Tabs.ts';

interface UserMenuProps {
    setSelectedTab: (tab: Tabs) => void;
}

const UserMenu: React.FC<UserMenuProps> = ({ setSelectedTab }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const handleButtonClick = () => {
        setIsOpen(!isOpen);
    };

    const closeMenu = () => {
        setIsOpen(false);
    };

    return (
        <div className="relative ml-3" ref={menuRef}>
            <button
                type="button"
                className="relative flex max-w-xs items-center rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-gray-200 w-[66px] h-[64px]"
                id="user-menu-button"
                aria-expanded={isOpen}
                aria-haspopup="true"
                onClick={handleButtonClick}
            >
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">Open user menu</span>
                <img className="w-8 h-8 rounded-full shadow-md" src={noProfile} alt="" />
            </button>
            {isOpen && (
                <UserMenuItemsGroup setSelectedTab={setSelectedTab} closeMenu={closeMenu} />
            )}
        </div>
    );
};

export default UserMenu;
