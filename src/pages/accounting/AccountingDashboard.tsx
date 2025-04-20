import { t } from "i18next";
import DashboardPieChart from "../../components/accounting/dashboard/DashboardPieChart.tsx";
import { DashboardCharts } from "../../types/accounting/dashboard/DashboardCharts.ts";
import { LineChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useEffect, useState, useMemo } from "react";
import DashboardTH from "../../components/accounting/dashboard/DashboardTH.tsx";
import DashboardTR from "../../components/accounting/dashboard/DashboardTR.tsx";

const xAxisData = Array.from({ length: 12 }, (_, i) =>
    dayjs().subtract(11 - i, "month").toDate()
);

function AccountingDashboard() {
    const [seriesData, setSeriesData] = useState([
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ]);
    const [credits, setCredits] = useState<{ categories: string[]; values: number[] }>({
        categories: [],
        values: [],
    });
    const [debits, setDebits] = useState<{ categories: string[]; values: number[] }>({
        categories: [],
        values: [],
    });

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getTransactionsByMonth")
            .then((result: number[][]) => {
                setSeriesData(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching transactions", error);
            });

        (window as any).ipcRenderer
            .invoke("getCreditsSumByCategory")
            .then((result: { categories: string[]; values: number[] }) => {
                setCredits(result);
            })
            .catch((err: any) => {
                console.error("Error when fetching credits", err);
            });

        (window as any).ipcRenderer
            .invoke("getDebitsSumByCategory")
            .then((result: { categories: string[]; values: number[] }) => {
                setDebits(result);
            })
            .catch((err: any) => {
                console.error("Error when fetching debits", err);
            });
    }, []);

    // Création de maps pour un accès rapide aux valeurs par catégorie
    const creditMap = useMemo(() => {
        return credits.categories.reduce<Record<string, number>>((acc, cat, idx) => {
            acc[cat] = credits.values[idx];
            return acc;
        }, {});
    }, [credits]);

    const debitMap = useMemo(() => {
        return debits.categories.reduce<Record<string, number>>((acc, cat, idx) => {
            acc[cat] = debits.values[idx];
            return acc;
        }, {});
    }, [debits]);

    // Union des catégories présentes dans les crédits et débits
    const synthesizedData = useMemo(() => {
        const allCategories = Array.from(new Set([...credits.categories, ...debits.categories]));
        return allCategories.map((category) => {
            const credit = creditMap[category] || 0;
            const debit = debitMap[category] || 0;
            const profit = credit - debit;
            return { category, credit, debit, profit };
        });
    }, [credits, debits, creditMap, debitMap]);

    // Fonction de formatage spécifique pour la colonne profit
    const formatProfit = (value: number): string => {
        if (value < 0) {
            return `-€${Math.abs(value).toFixed(2)}`;
        }
        return `€${value.toFixed(2)}`;
    };

    return (
        <div className="pb-20">
            <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"📊 " + t("dashboard")}</h1>

            <LineChart
                xAxis={[
                    {
                        data: xAxisData,
                        tickInterval: xAxisData,
                        scaleType: "time",
                        valueFormatter: (date) => dayjs(date).format("MMM"),
                    },
                ]}
                series={[
                    { label: t("debit"), data: seriesData[1], color: "#3b82f6" },
                    { label: t("credit"), data: seriesData[0], color: "#ef4444" },
                ]}
                height={400}
            />

            <h2 className="mt-8 mb-2 text-2xl">{"📉 " + t("debit")}</h2>
            <DashboardPieChart type={DashboardCharts.Debit} />
            <h2 className="mt-8 mb-2 text-2xl">{"📈 " + t("credit")}</h2>
            <DashboardPieChart type={DashboardCharts.Credit} />

            <h2 className="mt-8 mb-2 text-2xl">{"\uD83D\uDCDD " + t("synthesis")}</h2>
            <table className="w-full mt-5 table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2">
                <thead className="cursor-default select-none">
                    <tr className="border-b-gray-300 dark:border-b-gray-700 border-b-2">
                        <DashboardTH property={null} />
                        <DashboardTH property={DashboardCharts.Debit} />
                        <DashboardTH property={DashboardCharts.Credit} />
                        <DashboardTH property={DashboardCharts.Profit} />
                    </tr>
                </thead>
                <tbody>
                {synthesizedData.map((row) => (
                    <tr>
                        <DashboardTR border={true} content={row.category} property={null} />
                        <DashboardTR border={true} content={`€${row.debit.toFixed(2)}`} property={DashboardCharts.Debit} />
                        <DashboardTR border={true} content={`€${row.credit.toFixed(2)}`} property={DashboardCharts.Credit} />
                        <DashboardTR border={true} content={formatProfit(row.profit)} property={DashboardCharts.Profit} />
                    </tr>
                ))}
                </tbody>
            </table>
            <table className="w-full mt-0.5 table-auto border-white dark:border-gray-950 border-0">
                <tbody>
                    <tr>
                        <DashboardTR border={false} content={""} property={null} />
                        <DashboardTR border={false} content={`€${debits.values.reduce((a: number, b: number) => a + b, 0).toFixed(2)}`} property={DashboardCharts.Debit} />
                        <DashboardTR border={false} content={`€${credits.values.reduce((a: number, b: number) => a + b, 0).toFixed(2)}`} property={DashboardCharts.Credit} />
                        <DashboardTR border={false} content={`${formatProfit(credits.values.reduce((a: number, b: number) => a + b, 0) - debits.values.reduce((a: number, b: number) => a + b, 0))}`} property={DashboardCharts.Profit} />
                    </tr>
                </tbody>
            </table>
        </div>
    );
}

export default AccountingDashboard;