import React from 'react';
import NavItem from './NavItem';  // Assuming NavItem is in the same directory

interface NavItemData {
    href: string;
    text: string;
}

interface NavItemsGroupProps {
    items?: NavItemData[];
}

export const NavItemsGroup: React.FC<NavItemsGroupProps> = ({ items = [] }) => {

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