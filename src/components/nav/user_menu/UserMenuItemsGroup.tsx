import React from 'react';
import UserMenuItem from './UserMenuItem';
import { useTranslation } from 'react-i18next';
import Divider from '../Divider';

const UserMenuItemsGroup: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="absolute right-0 mt-2 p-2 pb-4 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
            <div role="menu" aria-orientation="vertical" aria-labelledby="user-menu-button">
                <h1 className='text-lg mt-4 mb-2 ml-1 text-black'>{t("user")}</h1>
                <Divider />
                <UserMenuItem text={t("settings")} />
            </div>
        </div>
    );
};

export default UserMenuItemsGroup;