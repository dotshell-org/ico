import React from 'react';
import NavItem from './NavItem';
import { useTranslation } from 'react-i18next';
import { Window } from '../../../types/Window';
import { Tabs } from '../../../types/Tabs';

interface NavItemsGroupProps {
    window: Window;
    selectedTab: Tabs;
    setSelectedTab: (tab: Tabs) => void;
}

export const NavItemsGroup: React.FC<NavItemsGroupProps> = ({ window, selectedTab, setSelectedTab }) => {
    const { t } = useTranslation();

    let items: { href: string, text: string, tab: Tabs }[] = [];
    if (window === Window.Accounting) {
        items = [
            { href: '/dashboard', text: t('dashboard'), tab: Tabs.AccountingDashboard },
            { href: '/entry', text: t('entry'), tab: Tabs.AccountingEntry },
            { href: '/outflow', text: t('outflow'), tab: Tabs.AccountingOutflow },
        ];
    }

    return (
        <div className="nav-items-group">
            {items.map((item, index) => (
                <NavItem
                    key={`nav-item-${index}`}
                    href={item.href}
                    text={item.text}
                    active={selectedTab === item.tab}
                    onClick={() => setSelectedTab(item.tab)}
                />
            ))}
        </div>
    );
};