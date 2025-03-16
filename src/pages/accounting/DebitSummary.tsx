import { useEffect, useState } from "react";
import { Filter } from "../../types/filter/Filter.ts";
import { Sort } from "../../types/sort/Sort.ts";
import { SummaryObject } from "../../types/summary/SummaryObject.ts";
import Summary from "../../components/summary/Summary.tsx";
import {t} from "i18next";
import {SummaryProperty} from "../../types/summary/SummaryProperty.ts";
import {Orientation} from "../../types/sort/Orientation.ts";

function DebitSummary() {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
    const [debits, setDebits] = useState<SummaryObject[]>([]);

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
        window.ipcRenderer
            .invoke("getDebits", filters, sorts)
            .then((result: SummaryObject[]) => {
                setDebits(result);
            })
            .catch((error: any) => {
                console.error("Erreur lors de la récupération des crédits", error);
            });
    }, [filters, sorts]);

    return (
        <Summary title={"📉 " + t("debit")} objects={debits} sorts={sorts} filters={filters} onFilterAdded={handleFilterAdded} onFilterRemoved={handleFilterRemoved} onSortAdded={handleSortAdded} onSortRemoved={handleSortRemoved} />
    );
}

export default DebitSummary;