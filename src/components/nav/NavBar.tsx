import React, { useState } from 'react';
import UserMenu from './user_menu/UserMenu';
import WindowSwitch from './tabs/WindowSwitch';
import { Window } from '../../types/nav/Window.ts';
import { NavItemsGroup } from './tabs/NavItemsGroup';
import IcoLogo from '/ico.svg';
import { Tabs } from '../../types/nav/Tabs.ts';

interface NavBarProps {
    selectedTab: Tabs;
    setSelectedTab: (tab: Tabs) => void;
}

const NavBar: React.FC<NavBarProps> = ({ selectedTab, setSelectedTab }) => {
    const [selectedWindow, setSelectedWindow] = useState<Window>(Window.Accounting);

    const handleSetSelectedWindow = (window: Window) => {
        if (window === Window.Accounting) {
            setSelectedTab(Tabs.AccountingDashboard);
        } else if (window === Window.Stock) {
            setSelectedTab(Tabs.StockDashboard);
        } else if (window === Window.Sales) {
            setSelectedTab(Tabs.SalesDashboard);
        }
        setSelectedWindow(window);
    }

    return (
        <nav className="fixed top-0 w-full bg-gray-100 dark:bg-gray-800 z-10">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-20 items-center justify-between">
                    <div className="w-full flex items-center">
                        <div className="ml-10 w-[calc(100%-10rem)] flex items-baseline space-x-4">
                            <img src={IcoLogo} alt="Ico Logo" className="relative top-2.5 right-5 h-8 w-auto invert dark:invert-0" />
                            <WindowSwitch window={Window.Accounting} selectedWindow={selectedWindow} setSelectedWindow={handleSetSelectedWindow} />
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