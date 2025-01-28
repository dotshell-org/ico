import React from 'react';
import Tooltip from '../Tooltip';

const PlusButton: React.FC = () => {

    return (
        <>
            <Tooltip text="New Filter">
                <button 
                    className="w-6 h-6 m-0 mx-1 p-0 bg-none text-black dark:text-white rounded-full border-gray-400 transition-all flex items-center justify-center" 
                >
                    +
                </button>
            </Tooltip>
            
        </>
    );
};

export default PlusButton;