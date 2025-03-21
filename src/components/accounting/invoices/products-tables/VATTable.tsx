import React, {useCallback, useEffect, useState} from "react";
import {t} from "i18next";
import CreditTH from "../../detailed-credits/tables/CreditTH.tsx";
import CreditTR from "../../detailed-credits/tables/CreditTR.tsx";
import {XMarkIcon} from "@heroicons/react/24/outline";
import {PlusIcon} from "@heroicons/react/16/solid";
import {InvoiceProduct} from "../../../../types/accounting/invoices/InvoiceProduct.ts";

interface VATTableProps {
    invoiceId: number;
    onUpdate: () => void;
}

const VATTable: React.FC<VATTableProps> = ({ invoiceId, onUpdate }) => {
    const [rows, setRows] = useState<InvoiceProduct[]>([]);
    const [isAdding, setIsAdding] = useState<boolean>(false);
    const [newProduct, setNewProduct] = useState<{
        name: string;
        amount: number;
        quantity: number;
        taxRate: number;
        discountPercentage: number;
        discountAmount: number;
    }>({
        name: t("new_product") || "",
        amount: 0,
        quantity: 1,
        taxRate: 20,
        discountPercentage: 0,
        discountAmount: 0,
    });

    useEffect(() => {
        const loadProducts = async () => {
            try {
                const products = await (window as any).ipcRenderer.invoke(
                    "getInvoiceProducts",
                    invoiceId
                );
                setRows(products);
            } catch (error) {
                console.error("Erreur lors du chargement des produits:", error);
            }
        };
        loadProducts();
    }, [invoiceId]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setIsAdding(false);
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const refreshProducts = useCallback(async () => {
        try {
            const products = await (window as any).ipcRenderer.invoke(
                "getInvoiceProducts",
                invoiceId
            );
            setRows(products);
        } catch (error) {
            console.error("Erreur lors du rechargement des produits:", error);
        }
    }, [invoiceId]);

    const handleDeleteProduct = async (productId: number) => {
        try {
            await (window as any).ipcRenderer.invoke(
                "deleteInvoiceProduct",
                productId
            );
            await refreshProducts();
            onUpdate();
        } catch (error) {
            console.error("Erreur lors de la suppression du produit:", error);
        }
    };

    const handleAddProduct = async () => {
        try {
            await (window as any).ipcRenderer.invoke(
                "addInvoiceProduct",
                invoiceId,
                newProduct.name,
                newProduct.amount,
                newProduct.quantity,
                newProduct.taxRate,
                newProduct.discountPercentage,
                newProduct.discountAmount,
            );
            await refreshProducts();
            onUpdate();
        } catch (error) {
            console.error("Erreur lors de l'ajout du produit:", error);
        }
        setIsAdding(false);
        setNewProduct({
            name: t("new_product") || "",
            amount: 0,
            quantity: 1,
            taxRate: 20,
            discountPercentage: 0,
            discountAmount: 0,
        });
    };

    return (
        <>
            <div className="flex items-center mt-2 mb-2">
                <h2 className="text-2xl cursor-default mb-2">🛍️ {t("products")}</h2>
            </div>

            <table className="w-full table-fixed border-white dark:border-gray-950 border-2 border-y-0 mb-4">
                <thead>
                <tr>
                    <CreditTH content={t("name")} />
                    <CreditTH content={t("excl_vat_amount")} />
                    <CreditTH content={t("quantity")} />
                    <CreditTH content={t("discount") + " (%)"} />
                    <CreditTH content={t("discount") + " (€)"} />
                    <CreditTH content={t("excl_vat_total")} />
                    <CreditTH content={t("tax_rate")} />
                    <CreditTH content={t("incl_vat_total")} />
                    <CreditTH className="w-10" content={t("actions")} />
                </tr>
                </thead>
                <tbody>
                {rows.map((row) => (
                    <tr key={row.id}>
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={row.name}
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={"€" + row.amount_excl_tax.toFixed(2)}
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={row.quantity.toString()}
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={
                                row.discount_percentage + "%"
                            }
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={
                                "€" + row.discount_amount.toFixed(2)
                            }
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={
                                "€" + ((row.amount_excl_tax * row.quantity * (1 - row.discount_percentage / 100)) - row.discount_amount).toFixed(2)
                            }
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={
                                row.tax_rate.toString() + "%"
                            }
                        />
                        <CreditTR
                            pointer={false}
                            border={true}
                            content={
                                "€" + ((row.amount_excl_tax * row.quantity * (1 - row.discount_percentage / 100) * (1 + row.tax_rate / 100)) - row.discount_amount).toFixed(2)
                            }
                        />
                        <td className="border-gray-300 dark:border-gray-700 border text-center align-middle">
                            <button
                                className="w-full h-full m-0 rounded-none group text-red-500 bg-white hover:bg-red-500 dark:bg-gray-950 border-0 hover:text-white transition-colors duration-200"
                                onClick={() => handleDeleteProduct(row.id)}
                            >
                                <XMarkIcon className="h-4 w-4 mx-auto" />
                            </button>
                        </td>
                    </tr>
                ))}

                {isAdding && (
                    <tr className="text-sm">
                        <td className="border-gray-300 dark:border-gray-700 border">
                            <input
                                type="text"
                                className="w-full p-1 pl-2 text-center border rounded dark:bg-gray-900 dark:border-gray-600"
                                value={newProduct.name}
                                onChange={(e) =>
                                    setNewProduct({ ...newProduct, name: e.target.value })
                                }
                            />
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border">
                            <input
                                type="number"
                                min="0"
                                className="w-full p-1 text-center border rounded dark:bg-gray-900 dark:border-gray-600"
                                value={newProduct.amount}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        amount: parseFloat(e.target.value) || 0
                                    })
                                }
                            />
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border">
                            <input
                                type="number"
                                min="1"
                                className="w-full p-1 text-center border rounded dark:bg-gray-900 dark:border-gray-600"
                                value={newProduct.quantity}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        quantity: parseInt(e.target.value) || 1
                                    })
                                }
                            />
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                className="w-full p-1 text-center border rounded dark:bg-gray-900 dark:border-gray-600"
                                value={newProduct.discountPercentage || 0}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        discountPercentage: parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="%"
                            />
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full p-1 text-center border rounded dark:bg-gray-900 dark:border-gray-600"
                                value={newProduct.discountAmount || 0}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        discountAmount: parseFloat(e.target.value) || 0,
                                    })
                                }
                                placeholder="€"
                            />
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border text-center">
                            {"€" +
                                ((newProduct.amount * newProduct.quantity * (1 - newProduct.discountPercentage / 100)) - newProduct.discountAmount).toFixed(2)}
                        </td>

                        <td className="border-gray-300 dark:border-gray-700 border">
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className="w-full p-1 text-center border rounded dark:bg-gray-900 dark:border-gray-600"
                                value={newProduct.taxRate}
                                onChange={(e) =>
                                    setNewProduct({
                                        ...newProduct,
                                        taxRate: parseFloat(e.target.value) || 0,
                                    })
                                }
                            />
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border text-center">
                            {"€" +
                                ((newProduct.amount * newProduct.quantity * (1 - newProduct.discountPercentage / 100) * (1 + newProduct.taxRate / 100)) - newProduct.discountAmount).toFixed(2)}
                        </td>
                        <td className="border-gray-300 dark:border-gray-700 border text-center align-middle">
                            <button
                                className="w-full h-full m-0 rounded-none group text-green-500 bg-white hover:bg-green-500 dark:bg-gray-950 border-0 hover:text-white transition-colors duration-200"
                                onClick={handleAddProduct}
                            >
                                <PlusIcon className="h-4 w-4 mx-auto" />
                            </button>
                        </td>
                    </tr>
                )}

                <tr>
                    <td
                        colSpan={9}
                        className="w-full border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border border-t-2 text-center text-gray-500 dark:text-gray-400 p-0 transition-all select-none cursor-pointer"
                        onClick={() => setIsAdding(true)}
                    >
                        <div className="flex justify-center items-center pr-1 text-sm">
                            <PlusIcon className="h-8 w-4 mr-1" />
                            {t("new")}
                        </div>
                    </td>
                </tr>

                </tbody>
            </table>
        </>
    )
}

export default VATTable