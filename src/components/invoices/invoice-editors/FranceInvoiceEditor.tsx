import {t} from "i18next";
import Container from "../Container.tsx";
import React, {useState, useEffect} from "react";
import InputField from "../InputField.tsx";
import {Invoice} from "../../../types/invoices/Invoice.ts";

interface FranceEditorProps {
    invoice: Invoice
}

const FranceInvoiceEditor: React.FC<FranceEditorProps> = ({ invoice }: FranceEditorProps) => {
    const [titleValue, setTitleValue] = useState<string>(invoice.title);
    const [categoryValue, setCategoryValue] = useState<string>(invoice.category);
    const [allCategories, setAllCategories] = useState<string[]>([]);
    const [nameValue, setNameValue] = useState<string>('');
    const [addressValue, setAddressValue] = useState<string>('');
    const [siretValue, setSiretValue] = useState<string>('');
    const [apeValue, setApeValue] = useState<string>('');
    const [vatValue, setVatValue] = useState<string>('');
    const [issueDate, setIssueDate] = useState<string>('');
    const [serviceDate, setServiceDate] = useState<string>('');

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await window.ipcRenderer.invoke("getAllCategories");
                setAllCategories(categories);
            } catch (error) {
                console.error("Error when loading categories:", error);
            }
        };
        loadCategories();
    }, []);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setTitleValue(e.target.value);
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCategory = e.target.value;
        try {
            await window.ipcRenderer.invoke("updateCreditCategory", invoice.id, newCategory);
            console.log("Category updated successfully!");
            setCategoryValue(newCategory);
        } catch (error) {
            console.error("Error when updating category:", error);
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

            <div className="w-[calc(100%-20rem)] mr-2">
                    <Container title={"\uD83C\uDD94 " + t("identification")}>
                        <h3>{t("name")}</h3>
                        <InputField
                            value={nameValue}
                            type="text"
                            onChange={setNameValue}
                        />

                        <h3>{t("address")}</h3>
                        <InputField
                            value={addressValue}
                            type="text"
                            onChange={setAddressValue}
                        />

                        <h3>SIRET/SIREN</h3>
                        <InputField
                            value={siretValue}
                            type="number"
                            onChange={setSiretValue}
                        />

                        <h3>APE/NAF</h3>
                        <InputField
                            value={apeValue}
                            type="number"
                            onChange={setApeValue}
                        />

                        <h3>{t("vat_no")}</h3>
                        <InputField
                            value={vatValue}
                            type="number"
                            onChange={setVatValue}
                        />
                    </Container>

                    <Container title={"\uD83D\uDDD3\uFE0F " + t("dates")}>
                        <h3>{t("issue")}</h3>
                        <InputField
                            value={issueDate}
                            type="date"
                            onChange={setIssueDate}
                        />

                        <h3>{t("sale_or_service")}</h3>
                        <InputField
                            value={serviceDate}
                            type="date"
                            onChange={setServiceDate}
                        />
                    </Container>

                    <Container title={"\uD83D\uDECD\uFE0F " + t("products")}>
                    <></>
                </Container>

                <div className="fixed right-0 top-0 h-full w-[20rem] border-l bg-gray-50 dark:bg-gray-900 border-gray-300 dark:border-gray-700 flex items-center justify-center">
                    <div className="block">
                        <input
                            className="text-3xl mb-20 font-bold bg-transparent w-full cursor-text outline-none block text-center"
                            placeholder={t("num_no")}
                        />
                        <h3 className="text-center text-md mt-8">
                            {t("excl_vat")}
                        </h3>
                        <h1 className="text-center text-4xl">
                            €0,00
                        </h1>
                        <h3 className="text-center text-md mt-8">
                            {t("incl_vat")}
                        </h3>
                        <h1 className="text-center text-4xl">
                            €0,00
                        </h1>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FranceInvoiceEditor;