import React from 'react';
import NavItem from './NavItem';
import { useTranslation } from 'react-i18next';
import { Window } from '../../../types/nav/Window.ts';
import { Tabs } from '../../../types/nav/Tabs.ts';

interface NavItemsGroupProps {
    window: Window;
    selectedTab: Tabs;
    setSelectedTab: (tab: Tabs) => void;
}

export const NavItemsGroup: React.FC<NavItemsGroupProps> = ({ window, selectedTab, setSelectedTab }) => {
    const { t }: { t: (key: string) => string } = useTranslation();

    let items: { text: string, tab: Tabs }[] = [];
    if (window === Window.Accounting) {
        items = [
            { text: t('dashboard'), tab: Tabs.AccountingDashboard },
            { text: t('debit'), tab: Tabs.AccountingDebit },
            { text: t('credit'), tab: Tabs.AccountingCredit },
            { text: t('detailed_credits'), tab: Tabs.AccountingDetailedCredits },
            { text: t('invoices'), tab: Tabs.AccountingInvoices },
        ];
    }

    return (
        <div className="flex p-1 overflow-x-auto whitespace-nowrap select-none">
            {items.map((item) => (
                <NavItem
                    text={item.text}
                    active={selectedTab === item.tab}
                    onClick={() => setSelectedTab(item.tab)}
                />
            ))}
        </div>
    );
};