import FilterSelection from "../../components/accounting/filter-selection/FilterSelection.tsx";
import {useEffect, useState} from "react";
import {Filter} from "../../types/accounting/filter/Filter.ts";
import {Sort} from "../../types/accounting/sort/Sort.ts";
import {t} from "i18next";
import InvoiceMiniatureRow from "../../components/accounting/invoices/InvoiceMiniatureRow.tsx";
import {Country} from "../../types/Country.ts";
import {Invoice} from "../../types/accounting/invoices/Invoice.ts";
import {SummaryProperty} from "../../types/accounting/summary/SummaryProperty.ts";
import {Orientation} from "../../types/accounting/sort/Orientation.ts";

interface InvoicesProps {
    handleInvoiceMiniatureRowClicked: (invoice: Invoice) => void;
}

const Invoices: React.FC<InvoicesProps> = ({ handleInvoiceMiniatureRowClicked }) => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [selectedTableType, setSelectedTableType] = useState<Country>(Country.None);

    const handleFilterAdded = (filter: Filter) => {
        setFilters(prev => [...prev, filter]);
    }
    const handleFilterRemoved = (filter: Filter) => {
        setFilters(prev => prev.filter(f => f !== filter));
    }

    const handleSortAdded = (sort: Sort) => {
        setSorts(prev => [...prev, sort]);
    }
    const handleSortRemoved = (sort: Sort) => {
        setSorts(prev => prev.filter(s => s !== sort));
    }

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getDebits", filters, sorts)
            .then((result: Invoice[]) => {
                setInvoices(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching invoices", error);
            });
    }, [filters, sorts]);

    const handleNewInvoice = () => {
        (window as any).ipcRenderer
            .invoke("addInvoice", t("new_invoice"), t("other"), selectedTableType)
            .then((result: Invoice) => {
                setInvoices(prev => [...prev, result]);
            })
            .catch((error: any) => {
                console.error("Error when adding debit", error);
            });
    }

    const handleInvoiceDeleted = (invoiceId: number) => {
        (window as any).ipcRenderer
            .invoke("deleteInvoice", invoiceId)
            .then(() => {
                setInvoices(invoices.filter(invoice => invoice.id !== invoiceId));
            })
            .catch((error: any) => {
                console.error("Error when deleting debit", error);
            });
    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"\uD83E\uDDFE " + t("invoices")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[60%]">
                        {t("title")}
                    </div>
                    <div className="w-[20%]">
                        {t("country")}
                    </div>
                    <div className="w-[20%]">
                        {t("total_amount")}
                    </div>
                    <div className="w-10">

                    </div>
                </td>
            </div>

            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-36 ">
                {
                    invoices.map((invoice) => (
                        <InvoiceMiniatureRow key={invoice.id} invoice={invoice} onClick={handleInvoiceMiniatureRowClicked} onDelete={handleInvoiceDeleted} />
                    ))
                }
            </table>


            <div className="">
                <label htmlFor="tableType" className="mr-2 mt-0">
                    {"🌎 " + t("country")}
                </label>
                <select
                    id="tableType"
                    value={selectedTableType}
                    onChange={(e) => setSelectedTableType(Number(e.target.value))}
                    className="mt-5 p-1 border rounded dark:bg-gray-900 dark:border-gray-600 cursor-pointer"
                >
                    <option value={Country.Debit}>{"📝 " + t("debit")}</option>
                    <option value={Country.None}>{"🚫 " + t("none")}</option>
                    <option value={Country.France}>{"🇫🇷 " + t("france")}</option>
                </select>
            </div>

            <button
                type="button"
                onClick={handleNewInvoice}
                className="mt-2 mb-16 p-1 w-full text-sm bg-transparent hover:bg-blue-500 border border-blue-500 text-blue-500 hover:text-white rounded transition-all duration-300"
            >
                {t("new")}
            </button>
        </>
    );
}

export default Invoices;