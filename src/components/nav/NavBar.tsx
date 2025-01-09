import React from 'react';
import UserMenu from './UserMenu';
import WindowSwitch from './WindowSwitch';
import { Window } from '../../types/Window';
import { NavItemsGroup } from './NavItemsGroup';
import glome from '/glome.svg';

const NavBar: React.FC = () => {
    return (
        <nav className="fixed top-0 w-full bg-gray-100 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <img className="size-10" src={glome} alt="Your Company" />
                        <div className="ml-10 flex items-baseline space-x-4">
                            <WindowSwitch window={Window.Accounting} />
                            <NavItemsGroup items={[
                                { href: '/dashboard', text: '📊 Dashboard' },
                                { href: '/entry', text: '🏦 Entry' },
                                { href: '/outflow', text: '🌍 Outflow' },
                            ]} />
                        </div>
                    </div>
                    <UserMenu />
                </div>
            </div>
        </nav>
    );
};

export default NavBar;