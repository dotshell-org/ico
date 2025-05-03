import React, {useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {t} from "i18next";
import {Filter} from "../../types/sales/summary/filter/Filter.ts";
import {Sort} from "../../types/sales/summary/sort/Sort.ts";
import {Sale} from "../../types/sales/summary/Sale.ts";
import {SummaryProperty} from "../../types/sales/summary/SummaryProperty.ts";
import {Orientation} from "../../types/accounting/sort/Orientation.ts";
import FilterSelection from "../../components/sales/filter-selection/FilterSelection.tsx";
import SalesSummaryTH from "../../components/sales/summary/SalesSummaryTH.tsx";
import SalesSummaryTR from "../../components/sales/summary/SalesSummaryTR.tsx";
import SalesAggregationToolbar from "../../components/sales/summary/SalesAggregationToolbar.tsx";

const SalesSummary = () => {
  const { i18n } = useTranslation();
  const [filters, setFilters] = useState<Filter[]>([]);
  const [sorts, setSorts] = useState<Sort[]>([{property: SummaryProperty.Date, orientation: Orientation.Desc}]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState<number | null>(null);

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
      .invoke("getSales", filters, sorts)
      .then((result: Sale[]) => {
        setSales(result);
      })
      .catch((error: any) => {
        console.error("Error when fetching sales", error);
      });
  }, [filters, sorts]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedColumn(null);
        setSelectedRows([]);
        setLastSelectedIndex(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language).format(date);
  };

  const handleCellClick = (
    event: React.MouseEvent<HTMLTableCellElement>,
    columnIndex: number,
    rowIndex: number,
    rowId: number
  ) => {
    if (selectedColumn !== null && selectedColumn !== columnIndex) {
      setSelectedColumn(columnIndex);
      setSelectedRows([rowId]);
      setLastSelectedIndex(rowIndex);
      return;
    }

    setSelectedColumn(columnIndex);

    if (event.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, rowIndex);
      const end = Math.max(lastSelectedIndex, rowIndex);
      const idsToSelect = sales.slice(start, end + 1).map((sale) => sale.id);
      setSelectedRows(idsToSelect);
    } else {
      if (selectedRows.includes(rowId)) {
        setSelectedRows(selectedRows.filter((id) => id !== rowId));
      } else {
        setSelectedRows([...selectedRows, rowId]);
      }
      setLastSelectedIndex(rowIndex);
    }
  };

  const selectedValues =
    selectedColumn !== null
      ? sales
          .filter((sale) => selectedRows.includes(sale.id))
          .map((sale) => {
            switch (selectedColumn) {
              case 0:
                return sale.date;
              case 1:
                return sale.object;
              case 2:
                return sale.quantity.toString();
              case 3:
                return sale.price.toString();
              case 4:
                return (sale.quantity * sale.price).toString();
              case 5:
                return sale.stock;
              default:
                return "";
            }
          })
      : [];

  return (
    <>
      <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
        <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"💰 " + t("sales")}</h1>
        <FilterSelection filters={filters} sorts={sorts} onAddedFilter={handleFilterAdded} onRemovedFilter={handleFilterRemoved} onAddedSort={handleSortAdded} onRemovedSort={handleSortRemoved} />
        <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-t-0 border-b-gray-300 dark:border-b-gray-700 border-b-2 cursor-pointer">
          <thead>
            <tr>
              <SalesSummaryTH property={SummaryProperty.Date} />
              <SalesSummaryTH property={SummaryProperty.Object} />
              <SalesSummaryTH property={SummaryProperty.Quantity} />
              <SalesSummaryTH property={SummaryProperty.Price} />
              <SalesSummaryTH property={SummaryProperty.Total} />
              <SalesSummaryTH property={SummaryProperty.Stock} />
            </tr>
          </thead>
        </table>
      </div>
      <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 cursor-copy mt-40">
        <tbody>
          {sales.map((sale, index) => (
            <tr key={sale.id}>
              <SalesSummaryTR
                content={formatDate(sale.date)}
                isSelected={selectedColumn === 0 && selectedRows.includes(sale.id)}
                onClick={(event) => handleCellClick(event, 0, index, sale.id)}
              />
              <SalesSummaryTR
                content={sale.object}
                isSelected={selectedColumn === 1 && selectedRows.includes(sale.id)}
                onClick={(event) => handleCellClick(event, 1, index, sale.id)}
              />
              <SalesSummaryTR
                content={sale.quantity.toString()}
                isSelected={selectedColumn === 2 && selectedRows.includes(sale.id)}
                onClick={(event) => handleCellClick(event, 2, index, sale.id)}
              />
              <SalesSummaryTR
                content={"€" + sale.price.toFixed(2)}
                isSelected={selectedColumn === 3 && selectedRows.includes(sale.id)}
                onClick={(event) => handleCellClick(event, 3, index, sale.id)}
              />
              <SalesSummaryTR
                  content={"€" + (sale.quantity * sale.price).toFixed(2).toString()}
                  isSelected={selectedColumn === 4 && selectedRows.includes(sale.id)}
                  onClick={(event) => handleCellClick(event, 4, index, sale.id)}
              />
              <SalesSummaryTR
                content={sale.stock}
                isSelected={selectedColumn === 5 && selectedRows.includes(sale.id)}
                onClick={(event) => handleCellClick(event, 5, index, sale.id)}
              />
            </tr>
          ))}
        </tbody>
      </table>

      <SalesAggregationToolbar columnIndex={selectedColumn} values={selectedValues} />
      <div className="h-20"></div>
    </>
  );
};

export default SalesSummary;