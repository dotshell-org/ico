import React from 'react';
import noProfile from '/no-profile.svg';

const UserMenu: React.FC = () => {
    return (
        <div className="relative ml-3">
            <button type="button" className="relative flex max-w-xs items-center rounded-full bg-gray-100 dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 focus:ring-offset-gray-200" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                <span className="absolute -inset-1.5"></span>
                <span className="sr-only">Open user menu</span>
                <img className="size-8 rounded-full shadow-md" src={noProfile} alt="" />
            </button>
        </div>
    );
};

export default UserMenu;