import React from 'react';
import NavItem from './NavItem';  // Assuming NavItem is in the same directory
import { useTranslation } from 'react-i18next';
import { Window } from '../../types/Window';

interface NavItemsGroupProps {
    window: Window;
}

export const NavItemsGroup: React.FC<NavItemsGroupProps> = ({ window }) => {

    const { t } = useTranslation();

    let items: { href: string, text: string }[] = [];
    if (window === Window.Accounting) {
        items = [
            { href: '/dashboard', text: t('dashboard') },
            { href: '/entry', text: t('entry') },
            { href: '/outflow', text: t('outflow') },
        ];
    } else if (window === Window.Stock) {
    } else if (window === Window.Sales) {
    } else if (window === Window.SchoolCafetManager) {
    }

    return (
        <div className="nav-items-group">
            {items.map((item, index) => (
                <NavItem
                    key={`nav-item-${index}`}
                    href={item.href}
                    text={item.text}
                />
            ))}
        </div>
    );
};