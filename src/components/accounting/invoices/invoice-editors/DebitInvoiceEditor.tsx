// filepath: /home/tristan/WebstormProjects/ico/src/components/accounting/invoices/invoice-editors/DebitInvoiceEditor.tsx
import {t} from "i18next";
import React, {useState, useEffect} from "react";
import DateField from "../DateField.tsx";
import {Invoice} from "../../../../types/accounting/invoices/Invoice.ts";

interface DebitEditorProps {
    invoice: Invoice;
}

const DebitInvoiceEditor: React.FC<DebitEditorProps> = ({ invoice }: DebitEditorProps) => {
    const [titleValue, setTitleValue] = useState<string>(invoice.title);
    const [categoryValue, setCategoryValue] = useState<string>(invoice.category);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [issueDate, setIssueDate] = useState<string>(invoice.issueDate);
    const [totalAmount, setTotalAmount] = useState<number>(invoice.totalAmount);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await (window as any).ipcRenderer.invoke("getAllCategories");
                setAllCategories(categories);
            } catch (error) {
                console.error("Error when loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        try {
            await (window as any).ipcRenderer.invoke("updateInvoiceTitle", invoice.id, newTitle);
            setTitleValue(newTitle);
        } catch (error) {
            console.error("Error when updating title:", error);
        }
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCategory = e.target.value;
        try {
            await (window as any).ipcRenderer.invoke("updateInvoiceCategory", invoice.id, newCategory);
            setCategoryValue(newCategory);
        } catch (error) {
            console.error("Error when updating category:", error);
        }
    };

    const handleIssueDateChange = async (value: string) => {
        try {
            if (value === "") return;
            await (window as any).ipcRenderer.invoke("updateInvoiceIssueDate", invoice.id, value);
            setIssueDate(value);
        } catch (error) {
            console.error("Error when updating issue date:", error);
        }
    }

    const handleAmountChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = parseFloat(e.target.value);
        if (isNaN(newAmount) || e.target.value === "" || newAmount < 0) {
            setTotalAmount(0);
            return;
        }

        try {
            // Checks if a product already exists for this simplified debit
            const existingProducts = await (window as any).ipcRenderer.invoke("getInvoiceProducts", invoice.id);
            const simpleDebitProduct = existingProducts.find((product: any) => product.name === t("simple_debit_entry"));

            if (simpleDebitProduct) {
                // Updates the existing product - modifies amount_excl_tax instead of quantity
                await (window as any).ipcRenderer.invoke("updateInvoiceProductAmountExclTax", simpleDebitProduct.id, newAmount);
            } else {
                // Adds a new product if none exists
                // Sets amount_excl_tax to newAmount and quantity to 1
                await (window as any).ipcRenderer.invoke("addInvoiceProduct", invoice.id, t("simple_debit_entry"), newAmount, 1, 0, 0, 0);
            }

            setTotalAmount(newAmount);
        } catch (error) {
            console.error("Error when updating amount:", error);
        }
    };

    return (
        <div className="pb-6">
            <input
                className="text-3xl mb-2 font-bold bg-transparent w-full cursor-text outline-none block"
                value={titleValue}
                onChange={handleTitleChange}
                placeholder={t("title")}
            />

            <input
                list="categoriesList"
                id="categoryDatalist"
                value={categoryValue}
                onChange={handleCategoryChange}
                placeholder={t("category")}
                className="mb-4 bg-transparent border-none underline"
            />
            <datalist id="categoriesList">
                {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                ))}
            </datalist>

            <div className="w-[calc(100%-12rem)] mr-2">
                <div className="mt-8">
                    <h2 className="text-2xl cursor-default mb-2">{"📅 " + t("date")}</h2>
                    <DateField
                        value={issueDate}
                        onChange={handleIssueDateChange}
                    />
                </div>
                <div className="mt-5">
                    <h2 className="text-2xl cursor-default mb-2">{"💰 " + t("amount")}</h2>
                    <input
                        className="w-full h-8 mb-4 px-3 text-sm border bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={totalAmount || ''}
                        type="number"
                        onChange={handleAmountChange}
                    />
                </div>
            </div>

            <div className="fixed right-0 top-0 h-full w-[12rem] border-l bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                <div className="block mt-20">
                    <h3 className="text-center text-md mt-8">
                        {t("total")}
                    </h3>
                    <h1 className="text-center text-3xl">
                        €{(totalAmount || 0).toFixed(2)}
                    </h1>
                </div>
            </div>
        </div>
    );
};

export default DebitInvoiceEditor;