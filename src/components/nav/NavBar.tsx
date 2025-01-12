import React from 'react';
import UserMenu from './UserMenu';
import WindowSwitch from './WindowSwitch';
import { Window } from '../../types/Window';
import { NavItemsGroup } from './NavItemsGroup';
import GlomeLogo from '/glome.svg';
import { useTranslation } from 'react-i18next';

const NavBar: React.FC = () => {
    
    const { t } = useTranslation();

    return (
        <nav className="fixed top-0 w-full bg-gray-100 dark:bg-gray-800">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 items-center justify-between">
                    <div className="flex items-center">
                        <img src={GlomeLogo} alt="Glome Logo" className="h-8 w-auto invert dark:invert-0" />
                        <div className="ml-10 flex items-baseline space-x-4">
                            <WindowSwitch window={Window.Accounting} />
                            <NavItemsGroup items={[
                                { href: '/dashboard', text: t('dashboard') },
                                { href: '/entry', text: t('entry') },
                                { href: '/outflow', text: t('outflow') },
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