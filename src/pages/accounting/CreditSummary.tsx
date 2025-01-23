import { useTranslation } from "react-i18next";
import { CreditSummaryTR, CreditSummaryTH } from "../../components/credit-summary/CreditSummaryRow";
import { CreditSummaryProperty } from "../../types/SummaryProperties";


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
            <h1 className="text-3xl mt-2 mb-6 font-bold cursor-default">{t("credit")}</h1>
            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-pointer">
                <thead>
                    <tr>
                        <CreditSummaryTH property={CreditSummaryProperty.Date} />
                        <CreditSummaryTH property={CreditSummaryProperty.Title} />
                        <CreditSummaryTH property={CreditSummaryProperty.Amount} />
                        <CreditSummaryTH property={CreditSummaryProperty.Category} />
                    </tr>
                </thead>
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
        </>
    )
}

export default CreditSummary;