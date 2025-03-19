import {t} from "i18next";
import Container from "../Container.tsx";
import React, {useState} from "react";
import InputField from "../InputField.tsx";
import {Invoice} from "../../../types/invoices/Invoice.ts";
import DefaultInvoiceEditor from "./DefaultInvoiceEditor.tsx";
import {TaxType} from "../../../types/invoices/TaxType.ts";

interface FranceEditorProps {
    invoice: Invoice;
}

const FranceInvoiceEditor: React.FC<FranceEditorProps> = ({ invoice }: FranceEditorProps) => {
    const [nameValue, setNameValue] = useState<string>('');
    const [addressValue, setAddressValue] = useState<string>('');
    const [siretValue, setSiretValue] = useState<string>('');
    const [apeValue, setApeValue] = useState<string>('');
    const [vatValue, setVatValue] = useState<string>('');

    return (
        <DefaultInvoiceEditor invoice={invoice} taxType={TaxType.VAT} >
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
        </DefaultInvoiceEditor>
    );
};

export default FranceInvoiceEditor;