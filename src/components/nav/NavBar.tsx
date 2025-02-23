import React, { useState } from 'react';
import UserMenu from './user_menu/UserMenu';
import WindowSwitch from './tabs/WindowSwitch';
import { Window } from '../../types/Window';
import { NavItemsGroup } from './tabs/NavItemsGroup';
import GlomeLogo from '/glome.svg';
import { Tabs } from '../../types/Tabs';

interface NavBarProps {
    selectedTab: Tabs;
    setSelectedTab: (tab: Tabs) => void;
}

const NavBar: React.FC<NavBarProps> = ({ selectedTab, setSelectedTab }) => {
    const [selectedWindow, setSelectedWindow] = useState<Window>(Window.Accounting);

    return (
        <nav className="fixed top-0 w-full bg-gray-100 dark:bg-gray-800 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="w-full flex items-center">
                        <div className="ml-10 w-[calc(100%-10rem)] flex items-baseline space-x-4">
                            <img src={GlomeLogo} alt="Glome Logo" className="relative top-2.5 right-5 h-8 w-auto invert dark:invert-0" />
                            <WindowSwitch window={Window.Accounting} selectedWindow={selectedWindow} setSelectedWindow={setSelectedWindow} />
                            <NavItemsGroup window={selectedWindow} selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
                        </div>
                        <UserMenu />
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;