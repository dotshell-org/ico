import {t} from "i18next";
import React, {useEffect, useState} from "react";
import {Filter} from "../../types/stock/summary/filter/Filter.ts";
import {Sort} from "../../types/stock/summary/sort/Sort.ts";
import {SummaryProperty} from "../../types/stock/summary/SummaryProperty.ts";
import {Orientation} from "../../types/accounting/sort/Orientation.ts";
import FilterSelection from "../../components/stock/filter-selection/FilterSelection.tsx";
import {Sale} from "../../types/sales/summary/Sale.ts";
import EditSaleInterface from "../../components/sales/detailed-sales/EditSaleInterface.tsx";
import NewSaleInterface from "../../components/sales/detailed-sales/NewSaleInterface.tsx";
import SaleMiniatureRow from "../../components/sales/detailed-sales/SaleMiniatureRow.tsx";

const EditSales: React.FC = () => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
    const [sales, setSales] = useState<Sale[]>([]);

    const [showEditInterface, setShowEditInterface] = useState<boolean>(false);
    const [showNewInterface, setShowNewInterface] = useState<boolean>(false);

    const [selectedSale, setSelectedSale] = useState<Sale>({
        id: 0,
        date: "2000-00-00",
        object: "",
        quantity: 0,
        price: 0,
        stock: ""
    });

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
        .invoke("getSales", filters, sorts)
            .then((result: Sale[]) => {
                setSales(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching sales", error);
            });
    }, [filters, sorts]);

    const handleRowClicked = (sale: Sale) => {
        setSelectedSale(sale);
        setShowEditInterface(true);
    }

    const handleEdited = () => {
        (window as any).ipcRenderer
            .invoke("getSales", filters, sorts)
            .then((result: Sale[]) => {
                setSales(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching sales", error);
            });
    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"✏️ " + t("edit_sales")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[40%] pt-3">
                        {t("object")}
                    </div>
                    <div className="w-[15%] pl-1.5 pt-3">
                        {t("stock")}
                    </div>
                    <div className="w-[15%] pl-1.5 pt-3">
                        {t("date")}
                    </div>
                    <div className="w-[15%] pl-1.5 pt-3">
                        {t("quantity")}
                    </div>
                    <div className="w-[15%] pl-1.5 pt-3">
                        {t("total")}
                    </div>
                    <div className="w-10"></div>
                </td>
            </div>

            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mt-[9.8rem] ">
                {
                    sales.map((sale) => (
                        <SaleMiniatureRow key={sale.id} sale={sale} onClick={() => handleRowClicked(sale)} onDelete={handleEdited} />
                    ))
                }
            </table>

            <button
                type="button"
                onClick={() => setShowNewInterface(true)}
                className="mt-5 mb-16 p-1 w-full text-sm bg-transparent hover:bg-blue-500 border border-blue-500 text-blue-500 hover:text-white rounded transition-all duration-300"
            >
                {t("new")}
            </button>

            {
                showEditInterface && <EditSaleInterface sale={selectedSale} onClose={() => setShowEditInterface(false)} onEdited={handleEdited} />
            }

            {
                showNewInterface && <NewSaleInterface onClose={() => setShowNewInterface(false)} onAdded={handleEdited} />
            }

        </>
    );
}

export default EditSales;