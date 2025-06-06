import {t} from "i18next";
import Container from "../Container.tsx";
import React, {useEffect, useState} from "react";
import {Invoice} from "../../../../types/accounting/invoices/Invoice.ts";
import DefaultInvoiceEditor from "./DefaultInvoiceEditor.tsx";
import {TaxType} from "../../../../types/accounting/invoices/TaxType.ts";
import CountrySpecificationField from "../CountrySpecificationField.tsx";

interface FranceEditorProps {
    invoice: Invoice;
}

const FranceInvoiceEditor: React.FC<FranceEditorProps> = ({ invoice }: FranceEditorProps) => {
    const [vendorName, setVendorName] = useState<string>('');
    const [vendorAddress, setVendorAddress] = useState<string>('');
    const [vendorSiret, setVendorSiret] = useState<string>('');
    const [vendorApe, setVendorApe] = useState<string>('');
    const [vendorVat, setVendorVat] = useState<string>('');

    const [customerName, setCustomerName] = useState<string>('');
    const [customerAddress, setCustomerAddress] = useState<string>('');
    const [customerVat, setCustomerVat] = useState<string>('');

    useEffect(() => {
        (window as any).ipcRenderer.invoke("getInvoiceCountrySpecifications", invoice.id)
            .then((specifications: Record<string, string>) => {
                setVendorName(specifications['vendor_name'] || '');
                setVendorAddress(specifications['vendor_address'] || '');
                setVendorSiret(specifications['vendor_siret'] || '');
                setVendorApe(specifications['vendor_ape'] || '');
                setVendorVat(specifications['vendor_vat'] || '');

                setCustomerName(specifications['customer_name'] || '');
                setCustomerAddress(specifications['customer_address'] || '');
                setCustomerVat(specifications['customer_vat'] || '');
            })
            .catch((error: any) => {
                console.error("Error fetching invoice country specifications:", error);
            });
    }, [invoice.id]);

    return (
        <DefaultInvoiceEditor invoice={invoice} taxType={TaxType.VAT} >
            <Container title={"👔 " + t("vendor_or_service_provider")}>
                <h3>{t("name")}</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="vendor_name" type="text" defaultValue={vendorName} prefix="" />

                <h3>{t("address")}</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="vendor_address" type="text" defaultValue={vendorAddress} prefix="" />

                <h3>SIRET</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="vendor_siret" type="number" defaultValue={vendorSiret} prefix="" />

                <h3>APE/NAF</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="vendor_ape" type="text" defaultValue={vendorApe} prefix="" />

                <h3>{t("vat_no")}</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="vendor_vat" type="number" defaultValue={vendorVat} prefix="FR" />
            </Container>
            <Container title={"👤 " + t("customer")}>
                <h3>{t("name")}</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="customer_name" type="text" defaultValue={customerName} prefix="" />

                <h3>{t("address")}</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="customer_address" type="text" defaultValue={customerAddress} prefix="" />

                <h3>{t("vat_no")}</h3>
                <CountrySpecificationField invoiceId={invoice.id} sqlKey="customer_vat" type="number" defaultValue={customerVat} prefix="FR" />
            </Container>
        </DefaultInvoiceEditor>
    );
};

export default FranceInvoiceEditor;