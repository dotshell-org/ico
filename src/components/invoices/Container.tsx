import React from "react";

interface ContainerProps {
    title: String;
    children: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({ title, children }) => {
    return (
        <>
            <h2 className="text-2xl cursor-default mb-2">{title}</h2>
            <div className="flex flex-col shadow-sm bg-white dark:bg-gray-950 border-gray-300 dark:border-gray-700 border p-3 pt-5 mb-6 rounded ">
                {children}
            </div>
        </>
    )
}

export default Container;