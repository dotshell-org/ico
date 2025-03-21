import React, {useState, useEffect} from "react";

interface InputFieldProps {
    invoiceId: number;
    sqlKey: string;
    type: string;
    defaultValue: string;
    prefix: string;
}

const CountrySpecificationField: React.FC<InputFieldProps> = ({invoiceId, sqlKey, type, defaultValue, prefix}) => {
    const [value, setValue] = useState<string>(defaultValue);

    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            const newValue = e.target.value;
            (window as any).ipcRenderer.invoke("updateInvoiceCountrySpecification", invoiceId, sqlKey, newValue);
            setValue(e.target.value);
        } catch (error) {
            console.error("Error updating invoice country specification:", error);
        }
    };

    return (
        <>
            {
                type === "number" && <div className="flex items-center w-full">
                    {prefix !== "" && <span className="pl-0.5 pr-2 mb-2 text-sm text-gray-500 dark:text-gray-400">{prefix}</span>}
                    <input
                        className="w-full h-8 mt-2 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={parseInt(value) || 0}
                        min={0}
                        type={type}
                        onChange={handleChange}
                    />
                </div> || type === "text" && <div className="flex items-center w-full">
                    {prefix !== "" && <span className="pl-0.5 pr-2 mb-2 text-sm text-gray-500 dark:text-gray-400">{prefix}</span>}
                    <input
                        className="w-full h-8 mt-2 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={value}
                        type={type}
                        onChange={handleChange}
                    />
                </div>
            }
        </>
    );
};

export default CountrySpecificationField;