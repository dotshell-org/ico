import {useEffect, useState} from "react";
import {Filter} from "../../types/filter/Filter.ts";
import {Sort} from "../../types/sort/Sort.ts";
import {SummaryObject} from "../../types/summary/SummaryObject.ts";
import Summary from "../../components/summary/Summary.tsx";
import {t} from "i18next";
import {SummaryProperty} from "../../types/summary/SummaryProperty.ts";
import {Orientation} from "../../types/sort/Orientation.ts";

function CreditSummary() {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
    const [credits, setCredits] = useState<SummaryObject[]>([]);

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
            .invoke("getCredits", filters, sorts)
            .then((result: SummaryObject[]) => {
                setCredits(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }, [filters, sorts]);
    
    return (
        <Summary title={"📈 " + t("credit")} objects={credits} sorts={sorts} filters={filters} onFilterAdded={handleFilterAdded} onFilterRemoved={handleFilterRemoved} onSortAdded={handleSortAdded} onSortRemoved={handleSortRemoved} />
    );
}

export default CreditSummary;