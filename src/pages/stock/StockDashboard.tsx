import { t } from "i18next";
import {BarChart} from "@mui/x-charts";
import React, { useEffect, useState } from "react";
import ObjectStockLineChart from "../../components/stock/dashboard/ObjectStockLineChart.tsx";
import { StockObject } from "../../types/stock/StockObject.ts";
import StockTH from "../../components/stock/table/StockTH.tsx";
import StockTR from "../../components/stock/table/StockTR.tsx";
import dayjs from "dayjs";

const StockDashboard: React.FC = () => {
    const [stockId, setStockId] = useState<number>(0);
    const [inventoryData, setInventoryData] = useState<StockObject[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    
    const [searchedInventoryData, setSearchedInventoryData] = useState<StockObject[]>([]);
    const [searchDate, setSearchDate] = useState<string>(dayjs().format("YYYY-MM-DD"));

    useEffect(() => {
        setIsLoading(true);
        (window as any).ipcRenderer
            .invoke("getInventory", dayjs().format("YYYY-MM-DD"), stockId)
            .then((result: StockObject[]) => {
                if (result.length === 0) {
                    setInventoryData([
                        {
                            id: 0,
                            name: "",
                            quantity: 0,
                        },
                    ]);
                } else {
                    setInventoryData(result);
                }
            })
            .catch((error: any) => {
                console.error("Error when fetching inventory", error);
            })
            .finally(() => {
                setIsLoading(false);
            });
    }, [stockId]);

    useEffect(() => {
        if (searchDate) {
            (window as any).ipcRenderer
                .invoke("getInventory", searchDate, stockId)
                .then((result: StockObject[]) => {
                    setSearchedInventoryData(result);
                })
                .catch((error: any) => {
                    console.error("Error fetching inventory by date", error);
                })
        }
    }, [searchDate, stockId]);
    
    return (
        <div className="pb-20">
            <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">
                {"📊 " + t("dashboard")}
            </h1>
            <select
                className="w-52 p-0.5 bg-gray-100 dark:bg-gray-900 rounded cursor-pointer"
                onChange={(e) => setStockId(Number(e.target.value))}
                value={stockId}
            >
                <option value={0}>Tout</option>
                <option value={1}>Stock A</option>
                <option value={2}>Stock B</option>
            </select>

            {isLoading ? (
                <div>{t("loading")}…</div>
            ) : (
                <>
                    <div className="mt-4">
                        <BarChart
                            xAxis={[
                                {
                                    data: inventoryData.map((item) => item.name),
                                    scaleType: "band",
                                    colorMap: {
                                        type: 'ordinal',
                                        colors: ['#ccebc5', '#a8ddb5', '#7bccc4', '#4eb3d3', '#2b8cbe', '#08589e']
                                    }
                                },
                            ]}
                            series={[
                                {
                                    data: inventoryData.map((item) => item.quantity),
                                    label: t("inventory")
                                },
                            ]}
                            height={400}
                            margin={{ left: 50, right: 50 }}
                        />
                    </div>

                    <h2 className="mt-8 mb-2 text-2xl">{"💡 " + t("object")}</h2>
                    <ObjectStockLineChart stockId={stockId} />

                    <h2 className="mt-8 mb-2 text-2xl flex items-center">
                        {"🕒 " + t("inventory_of")}
                        <input
                            type="date"
                            className="ml-2 border-gray-300 rounded"
                            defaultValue={dayjs().format("YYYY-MM-DD")}
                            onChange={(e) => setSearchDate(e.target.value)}
                        />
                    </h2>
                    <table className="w-full border-white dark:border-gray-950 border-2 border-y-0">
                        <thead>
                            <StockTH content={t("object")} />
                            <StockTH content={t("quantity")} />
                        </thead>
                        <tbody>
                        {searchedInventoryData.map((item) => (
                            <tr>
                                <StockTR key={item.id} content={item.name} />
                                <StockTR key={item.id} content={item.quantity.toString()} />
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )}
        </div>
    );
};

export default StockDashboard;