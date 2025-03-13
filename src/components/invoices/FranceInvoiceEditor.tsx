import {t} from "i18next";
import Container from "./Container.tsx";
import {Debit} from "../../types/invoices/Debit.ts";
import {useState, useEffect} from "react";
import InputField from "./InputField.tsx"; // Ajout de useEffect

declare global {
    interface Window {
        ipcRenderer: {
            invoke(channel: string, ...args: any[]): Promise<any>;
        }
    }
}

interface FranceEditorProps {
    invoice: Debit
}

const FranceInvoiceEditor: React.FC<FranceEditorProps> = ({ invoice }: FranceEditorProps) => {
    const [titleValue, setTitleValue] = useState<string>(invoice.title);
    const [categoryValue, setCategoryValue] = useState<string>(invoice.category);
    const [allCategories, setAllCategories] = useState<string[]>([]);

    useEffect(() => {
        const loadCategories = async () => {
            try {
                const categories = await window.ipcRenderer.invoke("getAllCategories");
                setAllCategories(categories);
            } catch (error) {
                console.error("Erreur lors du chargement des catégories:", error);
            }
        };
        loadCategories();
    }, []);

    const handleTitleChange = () => {
        // Implémentation à ajouter
    };

    const handleCategoryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newCategory = e.target.value;
        try {
            await window.ipcRenderer.invoke("updateCreditCategory", invoice.id, newCategory);
            console.log("Catégorie mise à jour avec succès !");
            setCategoryValue(newCategory);
        } catch (error) {
            console.error("Erreur lors de la mise à jour de la catégorie:", error);
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
                placeholder={t("raw_category")}
                className="mb-8 bg-transparent border-none underline"
            />
            <datalist id="categoriesList">
                {allCategories.map((cat) => (
                    <option key={cat} value={cat} />
                ))}
            </datalist>

            <div className="w-[calc(100%-20rem)] mr-2">
                <Container title={t("identification")}>
                    <h3>Nom</h3>
                    <InputField />

                    <h3>Adresse</h3>
                    <InputField />

                    <h3>SIRET/SIREN</h3>
                    <InputField />

                    <h3>APE/NAF</h3>
                    <InputField />

                    <h3>N° TVA Intercommunal</h3>
                    <InputField />
                </Container>
                <Container title={t("dates")}>
                    <h3>Emission</h3>
                    <InputField />

                    <h3>Vente/Prestation de service</h3>
                    <InputField />
                </Container>
                <Container title={t("products")}>
                    <h3>Content</h3>
                    <InputField />
                </Container>
            </div>

            <div className="fixed right-0 top-0 h-full w-[20rem] border-l bg-gray-50 dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                Hello World
            </div>

        </div>
    );
};

export default FranceInvoiceEditor;