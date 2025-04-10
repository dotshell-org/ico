import {t} from "i18next";
import MovementMiniatureRow from "../../components/stock/detailed-movements/MovementMiniatureRow.tsx";
import React, {useEffect, useState} from "react";
import {Filter} from "../../types/stock/summary/filter/Filter.ts";
import {Sort} from "../../types/stock/summary/sort/Sort.ts";
import {SummaryProperty} from "../../types/stock/summary/SummaryProperty.ts";
import {Orientation} from "../../types/accounting/sort/Orientation.ts";
import FilterSelection from "../../components/stock/filter-selection/FilterSelection.tsx";
import {Movement} from "../../types/stock/summary/Movement.ts";
import EditMovementInterface from "../../components/stock/detailed-movements/EditMovementInterface.tsx";

const EditStockMovements: React.FC = () => {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
    const [movements, setMovements] = useState<Movement[]>([]);

    const [showEditInterface, setShowEditInterface] = useState<boolean>(false);

    const [selectedMovement, setSelectedMovement] = useState<Movement>({
        id: 0,
        local_id: 0,
        stock_name: "",
        date: "2000-00-00",
        object: "",
        quantity: 0,
        movement: 0
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
        .invoke("getMovements", filters, sorts)
            .then((result: Movement[]) => {
                setMovements(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching movements", error);
            });
    }, [filters, sorts]);

    const handleRowClicked = (movement: Movement) => {
        setSelectedMovement(movement);
        setShowEditInterface(true);
    }

    const handleEdited = () => {
        (window as any).ipcRenderer
            .invoke("getMovements", filters, sorts)
            .then((result: Movement[]) => {
                setMovements(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching movements", error);
            });
    }

    const handleNewMovement = () => {

    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"✏️ " + t("edit_movements")}</h1>
                <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[40%] pl-1.5 pt-3">
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
                        {t("movement")}
                    </div>
                    <div className="w-10"></div>
                </td>
            </div>

            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mt-[9.8rem] ">
                {
                    movements.map((movement) => (
                        <MovementMiniatureRow key={movement.id} movement={movement} onClick={() => handleRowClicked(movement)} onDelete={handleEdited} />
                    ))
                }
            </table>

            <button
                type="button"
                onClick={handleNewMovement}
                className="mt-5 mb-16 p-1 w-full text-sm bg-transparent hover:bg-blue-500 border border-blue-500 text-blue-500 hover:text-white rounded transition-all duration-300"
            >
                {t("new")}
            </button>

            {
                showEditInterface && <EditMovementInterface movement={selectedMovement} onClose={() => setShowEditInterface(false)} onEdited={handleEdited} />
            }

        </>
    );
}

export default EditStockMovements;