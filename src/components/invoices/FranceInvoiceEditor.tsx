import {t} from "i18next";
import Container from "./Container.tsx";
import {Debit} from "../../types/invoices/Debit.ts";
import {useState} from "react";

interface FranceEditorProps {
    invoice: Debit
}

const FranceInvoiceEditor: React.FC<FranceEditorProps> = ({ invoice }: FranceEditorProps) => {

    const [titleValue, setTitleValue] = useState<string>(invoice.title);
    const [categoryValue, setCategoryValue] = useState<string>(invoice.category);
    const [allCategories, setAllCategories] = useState<string[]>([]);

    const handleTitleChange = () => {

    }

    const handleCategoryChange = () => {

    }

    return (
        <>
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

            <Container title={t("identification")}>
                <h3>Content</h3>
            </Container>
            <Container title={t("dates")}>
                <h3>Content</h3>
            </Container>
            <Container title={t("products")}>
                <h3>Content</h3>
            </Container>
        </>
    )
}

export default FranceInvoiceEditor;