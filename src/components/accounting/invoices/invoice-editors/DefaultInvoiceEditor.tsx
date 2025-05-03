import {t} from "i18next";
import Container from "../Container.tsx";
import React, {useState, useEffect} from "react";
import DateField from "../DateField.tsx";
import {Invoice} from "../../../../types/accounting/invoices/Invoice.ts";
import NoTaxTable from "../products-tables/NoTaxTable.tsx";
import {TaxType} from "../../../../types/accounting/invoices/TaxType.ts";
import VATTable from "../products-tables/VATTable.tsx";

interface FranceEditorProps {
    invoice: Invoice;
    taxType: TaxType;
    children?: React.ReactNode;
}

const FranceInvoiceEditor: React.FC<FranceEditorProps> = ({ invoice, taxType, children }: FranceEditorProps) => {
    const [titleValue, setTitleValue] = useState<string>(invoice.title);
    const [categoryValue, setCategoryValue] = useState<string>(invoice.category);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [issueDate, setIssueDate] = useState<string>(invoice.issueDate);
    const [serviceDate, setServiceDate] = useState<string>(invoice.saleServiceDate);
    const [exclVatTotal, setExclVatTotal] = useState<number>(0);
    const [inclVatTotal, setInclVatTotal] = useState<number>(0);
    const [invoiceNo, setInvoiceNo] = useState<string>("");

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

    useEffect(() => {
        const loadTotal = async () => {
            try {
                const total = await (window as any).ipcRenderer.invoke("getInvoiceExclTaxTotal", invoice.id);
                setExclVatTotal(total);
            } catch (error) {
                console.error("Error when loading total:", error);
            }
        }
        loadTotal();
    }, [invoice.id]);

    useEffect(() => {
        const loadTotal = async () => {
            try {
                const total = await (window as any).ipcRenderer.invoke("getInvoiceInclTaxTotal", invoice.id);
                setInclVatTotal(total);
            } catch (error) {
                console.error("Error when loading total:", error);
            }
        }
        loadTotal();
    }, [invoice.id]);

    useEffect(() => {
        const loadInvoiceNo = async () => {
            try {
                const no = await (window as any).ipcRenderer.invoke("getInvoiceNo", invoice.id);
                setInvoiceNo(no)
            } catch (error) {
                console.error("Error when loading invoice number:", error);
            }
        }
        loadInvoiceNo();
    }, []);

    const handleTotalUpdate = async () => {
        try {
            const newTotal = await (window as any).ipcRenderer.invoke("getInvoiceExclTaxTotal", invoice.id);
            setExclVatTotal(newTotal);
        } catch (error) {
            console.error("Error when updating total:", error);
        }
        try {
            const newTotal = await (window as any).ipcRenderer.invoke("getInvoiceInclTaxTotal", invoice.id);
            setInclVatTotal(newTotal);
        } catch (error) {
            console.error("Error when updating total:", error);
        }
    };

    const handleTitleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        try {
            await (window as any).ipcRenderer.invoke("updateInvoiceTitle", invoice.id, newTitle);
            console.log("Title updated successfully!");
            setTitleValue(newTitle);
        } catch (error) {
            console.error("Error when updating title:", error);
        }
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCategory = e.target.value;
        try {
            await (window as any).ipcRenderer.invoke("updateInvoiceCategory", invoice.id, newCategory);
            console.log("Category updated successfully!");
            setCategoryValue(newCategory);
        } catch (error) {
            console.error("Error when updating category:", error);
        }
    };

    const handleIssueDateChange = async (value: string) => {
        try {
            if (value == "") {
                return
            }
            await (window as any).ipcRenderer.invoke("updateInvoiceIssueDate", invoice.id, value);
            console.log("Issue date updated successfully!");
            setIssueDate(value);
        } catch (error) {
            console.error("Error when updating issue date:", error);
        }
    }

    const handleSaleServiceDateChange = async (value: string) => {
        try {
            if (value == "") {
                return
            }
            await (window as any).ipcRenderer.invoke("updateInvoiceSaleServiceDate", invoice.id, value);
            console.log("Sale/service date updated successfully!");
            setServiceDate(value);
        } catch (error) {
            console.error("Error when updating sale/service date:", error);
        }
    }

    const handleChangeNo = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNo = e.target.value;
        try {
            await (window as any).ipcRenderer.invoke("updateInvoiceNo", invoice.id, newNo);
            setInvoiceNo(newNo);
        } catch (error) {
            console.error("Error when updating invoice number:", error);
        }
    };

    return (
        <div className="pb-6">
            <input
                className="text-3xl mb-2 font-bold bg-transparent w-full cursor-text outline-none block"
                value={titleValue}
                onChange={handleTitleChange}
            />

            <input
                list="categoriesList"
                id="categoryDatalist"
                value={categoryValue}
                onChange={handleCategoryChange}
                placeholder={t("category")}
                className="mb-8 bg-transparent border-none underline"
            />
            <datalist id="categoriesList">
                {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                ))}
            </datalist>

            <div className="w-[calc(100%-12rem)] mr-2">
                { children }
                <Container title={"\uD83D\uDDD3\uFE0F " + t("dates")}>
                    <h3>{t("issue")}</h3>
                    <DateField
                        value={issueDate}
                        onChange={handleIssueDateChange}
                    />

                    <h3>{t("sale_or_service")}</h3>
                    <DateField
                        value={serviceDate}
                        onChange={handleSaleServiceDateChange}
                    />
                </Container>

                {
                    taxType === TaxType.None ? (
                        <NoTaxTable invoiceId={invoice.id} onUpdate={handleTotalUpdate} />
                    ) : taxType === TaxType.VAT ? (
                        <VATTable invoiceId={invoice.id}  onUpdate={handleTotalUpdate} />
                    ) : null
                }

                <div className="fixed right-0 top-0 h-full w-[12rem] border-l bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                    <div className="block mt-20">
                        <input
                            className="text-2xl text-center mb-12 font-bold bg-transparent w-full cursor-text outline-none block"
                            placeholder={t("num_no")}
                            value={invoiceNo}
                            onChange={(e) => {
                                if (e.target.value.length <= 19) {
                                    handleChangeNo(e);
                                }
                            }}
                            style={{fontSize: `min(1.5rem, ${16 / Math.max(invoiceNo.length, 1)}rem)`}}
                        />
                        {
                            taxType === TaxType.None ? (
                                <>
                                    <h3 className="text-center text-md mt-8">
                                        {t("total")}
                                    </h3>
                                    <h1 className="text-center text-3xl">
                                        €{exclVatTotal.toFixed(2)}
                                    </h1>
                                </>
                            ) : taxType === TaxType.VAT ? (
                                <>
                                    <h3 className="text-center text-md mt-8">
                                        {t("excl_vat_total")}
                                    </h3>
                                    <h1 className="text-center text-3xl">
                                        €{exclVatTotal.toFixed(2)}
                                    </h1>
                                    <h3 className="text-center text-md mt-8">
                                        {t("incl_vat_total")}
                                    </h3>
                                    <h1 className="text-center text-3xl">
                                        €{inclVatTotal.toFixed(2)}
                                    </h1>
                                </>
                            ) : null
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranceInvoiceEditor;