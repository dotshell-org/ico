import React from "react";
import {MoneyType} from "../../../types/detailed-credits/MoneyType.ts";
import CreditTH from "./CreditTH.tsx";

interface CreditTableProps {
    id: number;
    type: MoneyType;
}

const CreditTable: React.FC<CreditTableProps> = ({ id, type }) => {
    return (
        <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mb-10">
            <h1>ID {id}</h1>
            <thead>
                <CreditTH content={"Amount"} />
                {type !== MoneyType.Other && <CreditTH content={"Quantity"} />}
                <CreditTH content={"Total"} />
                {type === MoneyType.Coins && <CreditTH content={"Weight"} />}
            </thead>
        </table>
    )
}

export default CreditTable