import { PieChart, useDrawingArea } from "@mui/x-charts";
import { t } from "i18next";
import { styled } from "@mui/material/styles";
import { DashboardCharts } from "../../types/DashboardCharts";
import React, { useEffect, useState } from "react";

interface CustomPieChartProps {
    type: DashboardCharts;
}

const DashboardPieChart: React.FC<CustomPieChartProps> = ({ type }) => {
    const [data, setData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const api = (): string => {
        if (type === DashboardCharts.Credit) {
            return "getCreditsSumByCategory";
        } else if (type === DashboardCharts.Debit) {
            return "getDebitsSumByCategory";
        } else if (type === DashboardCharts.Profit) {
            return "getProfitByCategory";
        } else {
            return "";
        }
    };

    useEffect(() => {
        setIsLoading(true);
        window.ipcRenderer
            .invoke(api())
            .then((result: Object) => {
                setData(result);
                setIsLoading(false);
            })
            .catch((err: any) => {
                console.error("Error when fetching data", err);
                setError("Erreur lors de la récupération des données");
                setIsLoading(false);
            });
    }, [type]);

    function formatNumber(n: number): string {
        if (n >= 1e12) {
            return `${(n / 1e12).toFixed(1)}T`;
        } else if (n >= 1e9) {
            return `${(n / 1e9).toFixed(1)}B`;
        } else if (n >= 1e6) {
            return `${(n / 1e6).toFixed(1)}M`;
        } else if (n >= 1e3) {
            return `${(n / 1e3).toFixed(1)}k`;
        } else {
            return `${n.toFixed(1)}`;
        }
    }

    function generateData() {
        if (!data || !data.categories) return [];
        const finalData = [];
        for (let i = 0; i < data.categories.length; i++) {
            finalData.push({
                label: data.categories[i],
                value: data.values[i],
            });
        }
        return finalData;
    }

    const series = [
        {
            name: t("salesDistribution"),
            innerRadius: 100,
            cornerRadius: 10,
            paddingAngle: 1,
            data: generateData(),
        },
    ];

    let rainbowColors: string[];
    if (type === DashboardCharts.Credit) {
        rainbowColors = [
            "#ff7f7f", "#ff6b6b", "#ff5757", "#ff4343", "#ff2f2f",
            "#ff1b1b", "#ff0707", "#e50000", "#cc0000", "#b20000"
        ];
    }
    else if (type === DashboardCharts.Debit) {
        rainbowColors = [
            "#7ec8ff", "#5abeff", "#36a3ff", "#1288ff", "#006dea",
            "#005bb5", "#004a9f", "#003a88", "#002971", "#00185a"
        ];
    }
    else if (type === DashboardCharts.Profit) {
        rainbowColors = [
            "#c099ff", "#b17aff", "#a25cff", "#933dff", "#841eff",
            "#7500e6", "#6600cc", "#5700b3", "#480099", "#39007f"
        ];
    }
    else {
        rainbowColors = [];
    }

    const StyledText = styled("text")(({ theme }) => ({
        fill: theme.palette.text.primary,
        textAnchor: "middle",
        dominantBaseline: "central",
        fontSize: 50,
    }));

    function PieCenterLabel({ children }: { children: React.ReactNode }) {
        const { width, height, left, top } = useDrawingArea();
        return (
            <StyledText x={left + width / 2} y={top + height / 2}>
                {children}
            </StyledText>
        );
    }

    function paragraphContent(): string {
        const paragraph =
            type === DashboardCharts.Credit
                ? t("p_credit")
                : type === DashboardCharts.Debit
                    ? t("p_debit")
                    : type === DashboardCharts.Profit
                        ? t("p_profit")
                        : "";
        return paragraph
            .replace("{categories}", `<strong>${data.categories.length}</strong>`)
            .replace("{amount}", `<strong>€${data.values.reduce((a: number, b: number) => a + b, 0).toFixed(2)}</strong>`);
    }

    if (isLoading) {
        return <div>loading...</div>;
    }

    if (error) {
        return <div>{error}</div>;
    }

    return (
        <div className="flex items-center">
            <div className="w-1/6 h-[21rem] p-4 mr-2 rounded shadow-sm border border-gray-300 dark:border-gray-700">
                <p
                    className="text-left"
                    dangerouslySetInnerHTML={{ __html: paragraphContent() }}
                ></p>
            </div>

            <div className="w-5/6 h-[21rem] p-4 rounded shadow-sm border border-gray-300 dark:border-gray-700">
                <PieChart
                    margin={{ right: 250 }}
                    series={series}
                    height={300}
                    colors={rainbowColors}
                >
                    <PieCenterLabel>€{formatNumber(data.values.reduce((a: number, b: number) => a + b, 0))}</PieCenterLabel>
                </PieChart>
            </div>
        </div>
    );
};

export default DashboardPieChart;