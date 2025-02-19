// src/Tooltip.js
import React, { useState, useEffect } from 'react';

interface TooltipProps {
    children: React.ReactNode;
    text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [hover, setHover] = useState(false);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (hover) {
            timer = setTimeout(() => setShowTooltip(true), 400);
        } else {
            setShowTooltip(false);
        }
        return () => clearTimeout(timer);
    }, [hover]);

    return (
        <div className="relative inline-block">
            <div
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => setHover(false)}
            >
                {children}
            </div>
            {showTooltip && (
                <div className="absolute z-10 w-max p-1 text-sm text-white bg-blue-500 dark:bg-blue-600 rounded-md shadow-lg -translate-x-1/2 left-1/2 bottom-full mb-2">
                    {text}
                </div>
            )}
        </div>
    );
};

export default Tooltip;

