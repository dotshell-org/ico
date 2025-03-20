import React, {useState, useEffect} from "react";

interface InputFieldProps {
    invoiceId: number;
    sqlKey: string;
    type: string;
    defaultValue: string;
}

const CountrySpecificationField: React.FC<InputFieldProps> = ({invoiceId, sqlKey, type, defaultValue}) => {
    const [value, setValue] = useState<string>(defaultValue);

    // Mettre à jour la valeur quand defaultValue change
    useEffect(() => {
        setValue(defaultValue);
    }, [defaultValue]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            (window as any).ipcRenderer.invoke("updateInvoiceCountrySpecification", invoiceId, sqlKey, e.target.value.toString());
            setValue(e.target.value);
        } catch (error) {
            console.error("Error updating invoice country specification:", error);
        }
    };

    return (
        <>
            {
                type === "number" && <input
                    className="w-full h-8 mt-2 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={parseInt(value) || 0}
                    min={0}
                    type={type}
                    onChange={handleChange}
                /> || type === "text" && <input
                    className="w-full h-8 mt-2 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={value}
                    type={type}
                    onChange={handleChange}
                />
            }
        </>
    );
};

export default CountrySpecificationField;