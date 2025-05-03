import React from 'react';
import UserMenuItem from './UserMenuItem';
import { useTranslation } from 'react-i18next';
import Divider from '../Divider';
import noProfile from '/no-profile.svg';
import { Tabs } from '../../../types/nav/Tabs';

interface UserMenuItemsGroupProps {
    setSelectedTab: (tab: Tabs) => void;
    closeMenu: () => void;
}

const UserMenuItemsGroup: React.FC<UserMenuItemsGroupProps> = ({ setSelectedTab, closeMenu }) => {
    const { t }: { t: (key: string) => string } = useTranslation();

    const handleSettingsClick = () => {
        setSelectedTab(Tabs.Settings);
        closeMenu();
    };

    return (
        <div className="absolute right-0 mt-2 p-2 pb-4 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 dark:bg-gray-800 dark:ring-gray-600">
            <div role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                <div className="mt-4 ml-1 mb-2">
                    <img className="size-8 rounded-full shadow-md mb-1 mr-3 inline-block" src={noProfile} alt="" />
                    <h1 className='text-sm mb-2 text-black inline-block dark:text-white'>{t("user")}</h1>
                </div>
                
                <Divider />
                <UserMenuItem 
                    text={"⚙️ " + t("settings")}
                    onClick={handleSettingsClick}
                />
            </div>
        </div>
    );
};

export default UserMenuItemsGroup;