import FilterSelection from "../../components/filter-selection/FilterSelection.tsx";
import {useEffect, useState} from "react";
import {Filter} from "../../types/filter/Filter.ts";
import {Sort} from "../../types/sort/Sort.ts";
import {t} from "i18next";
import CreditMiniatureRow from "../../components/detailed-credits/CreditMiniatureRow.tsx";
import {Credit} from "../../types/detailed-credits/Credit.ts";

interface DetailedCreditsProps {
    handleCreditMiniatureRowClicked: (credit: Credit) => void;
}

const DetailedCredits: React.FC<DetailedCreditsProps> = ({ handleCreditMiniatureRowClicked }) => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([]);
    const [credits, setCredits] = useState<Credit[]>([]);

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
            .invoke("getCreditsList", filters, sorts)
            .then((result: Credit[]) => {
                setCredits(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }, [filters, sorts]);

    const handleNewCredit = () => {
        (window as any).ipcRenderer
            .invoke("addCreditGroup", t("new_credit"), t("other"))
            .then((result: Credit) => {
                setCredits(prev => [...prev, result]);
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }

    const handleCreditDeleted = (creditId: number) => {
        (window as any).ipcRenderer
            .invoke("deleteCreditGroup", creditId)
            .then(() => {
                setCredits(credits.filter(credit => credit.id !== creditId));
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            })
    }
    
    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"\uD83D\uDCDD " + t("detailed_credits")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[60%]">
                        {t("title")}
                    </div>
                    <div className="w-[20%]">
                        {t("tables_types")}
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
                    credits.map((credit) => (
                        <CreditMiniatureRow key={credit.id} credit={credit} onClick={handleCreditMiniatureRowClicked} onDelete={handleCreditDeleted} />
                    ))
                }
            </table>

            <button
                type="button"
                onClick={handleNewCredit}
                className="mt-5 mb-16 p-1 w-full text-sm bg-transparent hover:bg-blue-500 border border-blue-500 text-blue-500 hover:text-white rounded transition-all duration-300"
            >
                {t("raw_new")}
            </button>
        </>
    );
}

export default DetailedCredits;