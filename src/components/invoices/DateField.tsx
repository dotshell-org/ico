import React from "react";

interface InputFieldProps {
    value: string;
    onChange: (value: string) => void;
}

const DateField: React.FC<InputFieldProps> = ({ value, onChange }) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
    };

    return (
        <input
            className="w-full h-8 mt-2 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={value}
            type="date"
            onChange={handleChange}
        />
    );
};

export default DateField;