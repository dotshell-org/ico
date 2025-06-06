import {LineChart} from "@mui/x-charts";
import dayjs from "dayjs";
import {t} from "i18next";
import React, {useEffect, useState} from "react";
import DOMPurify from 'dompurify';
import IPCService from '../../../services/IPCService';

interface ObjectStockLineChartProps {
    stockName: string;
}

const ObjectStockLineChart: React.FC<ObjectStockLineChartProps> = ({ stockName }) => {
    const [allObjects, setAllObjects] = useState<string[]>([]);

    const [selectedObject, setSelectedObject] = useState<string>(t("nothing"));
    const [selectedObjectMin, setSelectedObjectMin] = useState<number>(0);
    const [selectedObjectMax, setSelectedObjectMax] = useState<number>(0);

    const [stockData, setStockData] = useState<number[]>(Array(12).fill(0));
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        IPCService.invoke<string[]>("getAllObjects")
            .then((result) => {
                setAllObjects(result);
            })
            .catch((error) => {
                console.error("Error when fetching objects", error);
            });
    }, []);

    useEffect(() => {
        setIsLoading(true);
        (window as any).ipcRenderer
            .invoke("getObjectAmountCurve", selectedObject, stockName)
            .then((result: number[]) => {
                if (result.length === 0) {
                    setStockData(Array(12).fill(0));
                    setSelectedObjectMin(0);
                    setSelectedObjectMax(0);
                } else {
                    setStockData(result);
                    setSelectedObjectMin(Math.min(...result));
                    setSelectedObjectMax(Math.max(...result));
                }
            })
            .catch((error: any) => {
                console.error("Error when fetching object amount curve", error);
                setStockData(Array(12).fill(0));
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [selectedObject, stockName]);

    const xAxisData = Array.from({ length: 12 }, (_, i) =>
        dayjs().subtract(11 - i, "month").toDate()
    );

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedObject(event.target.value);
    };

    const accumulatedStockText = t("p_stock")
        .replace("{min_amount}", `<strong>${selectedObjectMin.toString()}</strong>`)
        .replace("{max_amount}", `<strong>${selectedObjectMax.toString()}</strong>`)
        .replace("{object}", `<strong>${selectedObject}</strong>`);

    const sanitizedStockText = DOMPurify.sanitize(accumulatedStockText);

    return (
        <div className="flex items-center">
            <div className="w-1/6 h-[21rem] p-4 mr-2 rounded shadow-sm border border-gray-300 dark:border-gray-700">
                <div className="text-left">
                    <select
                        className="border border-gray-300 dark:border-gray-700 dark:bg-gray-800 cursor-pointer rounded p-1 mt-1 mb-2 w-full"
                        onChange={handleSelectChange}
                        value={selectedObject}
                    >
                        <option value={t("nothing")}>{t("nothing")}</option>
                        {allObjects.map((object) => (
                            <option key={object} value={object}>
                                {object}
                            </option>
                        ))}
                    </select>
                    <div
                        dangerouslySetInnerHTML={{ __html: sanitizedStockText }}
                    />
                </div>
            </div>

            <div className="w-5/6 h-[21rem] p-4 rounded shadow-sm border border-gray-300 dark:border-gray-700">
                {isLoading ? (
                    <div>{t("loading")}…</div>
                ) : (
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
                            {
                                data: stockData,
                                label: t("stock"),
                                color: "#eab308",
                            },
                        ]}
                        height={300}
                        margin={{ left: 50, right: 50 }}
                    />
                )}
            </div>
        </div>
    );
};

export default ObjectStockLineChart;