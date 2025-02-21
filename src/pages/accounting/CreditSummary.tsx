import { useEffect, useState } from "react";
import { Filter } from "../../types/filter/Filter.ts";
import { Sort } from "../../types/sort/Sort.ts";
import { SummaryObject } from "../../types/summary/SummaryObject.ts";
import Summary from "../../components/summary/Summary.tsx";
import {t} from "i18next";

function CreditSummary() {
    const [filters, setFilters] = useState<Filter[]>([]);
    const [sorts, setSorts] = useState<Sort[]>([]);
    const [credits, setCredits] = useState<SummaryObject[]>([]);

    const handleFilterAdded = (filter: Filter) => {
        setFilters(prev => [...prev, filter]);
    }
    const handleFilterRemoved = (filter: Filter) => {
        setFilters(prev => prev.filter(f => f !== filter));
    }

    useEffect(() => {
        setSorts([])
    }, []);

    useEffect(() => {
        window.ipcRenderer
            .invoke("getCredits", filters, sorts)
            .then((result: SummaryObject[]) => {
                setCredits(result);
            })
            .catch((error: any) => {
                console.error("Erreur lors de la récupération des crédits", error);
            });
    }, [filters, sorts]);
    
    return (
        <Summary title={t("credit")} objects={credits} sorts={sorts} filters={filters} onFilterAdded={handleFilterAdded} onFilterRemoved={handleFilterRemoved} />
    );
}

export default CreditSummary;