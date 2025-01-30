import { useTranslation } from "react-i18next";
import { CreditSummaryTR, CreditSummaryTH } from "../../components/credit-summary/CreditSummaryRow";
import { CreditSummaryProperty } from "../../types/SummaryProperties";
import FilterSelection from "../../components/filter-selection/FilterSelection";


function CreditSummary() {

    const { t } = useTranslation();
  
    const creditData = [
        
    ];
    for (let i = 1; i <= 50; i++) {
        creditData.push({
            date: `Date ${i}`,
            title: `Title ${i}`,
            amount: `€${i * 100}.00`,
            category: `Category ${i}`
        });
    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{t("credit")}</h1>
                <FilterSelection filters={[]}/>
                <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
                    <thead>
                        <tr>
                            <CreditSummaryTH property={CreditSummaryProperty.Date} />
                            <CreditSummaryTH property={CreditSummaryProperty.Title} />
                            <CreditSummaryTH property={CreditSummaryProperty.Amount} />
                            <CreditSummaryTH property={CreditSummaryProperty.Category} />
                        </tr>
                    </thead>
                </table>
            </div>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-40">
                <tbody>
                    {
                        creditData.map((data, index) => {
                            return (
                                <tr key={index}>
                                    <CreditSummaryTR content={data.date} />
                                    <CreditSummaryTR content={data.title} />
                                    <CreditSummaryTR content={data.amount} />
                                    <CreditSummaryTR content={data.category} />
                                </tr>
                            )
                        })
                    }
                </tbody>
            </table>
            <div className="h-20"></div>
        </>
    )
}

export default CreditSummary;