import React from "react";
import {Movement} from "../../../types/stock/summary/Movement.ts";
import {XMarkIcon} from "@heroicons/react/24/outline";
import i18n from "i18next";

interface MovementMiniatureRowProps {
    movement: Movement;
    onClick: (movement: Movement) => void;
    onDelete: () => void;
}

const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(i18n.language).format(date);
};

const MovementMiniatureRow: React.FC<MovementMiniatureRowProps> = ({ movement, onClick, onDelete }) => {

    const handleDeleted = () => {
        (window as any).ipcRenderer
            .invoke("deleteMovement", movement.local_id, movement.quantity > 0)
            .then(() => {
                onDelete();
            })
            .catch((error: any) => {
                console.error("Error deleting movement", error);
            });
    }

    return (
        <td
            className={`flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 hover:bg-gray-50 dark:hover:bg-gray-900 border-b text-left text-sm transition-all cursor-pointer select-none`}
        >
            <div
                onClick={() => onClick(movement)}
                className="w-[40%] pl-1.5 pt-3"
            >
                {movement.object}
            </div>
            <div
                onClick={() => onClick(movement)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {movement.stock_name}
            </div>
            <div
                onClick={() => onClick(movement)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {formatDate(movement.date)}
            </div>
            <div
                onClick={() => onClick(movement)}
                className="w-[15%] pl-1.5 pt-3"
            >
                {movement.quantity}
            </div>
            <div
                onClick={() => onClick(movement)}
                className={`w-[15%] pl-1.5 pt-3 font-bold ${
                    movement.movement > 0
                        ? 'text-green-500'
                        : movement.movement < 0
                            ? 'text-red-500'
                            : 'text-gray-500'
                }`}
            >
                {movement.movement > 0 ? `+${movement.movement}` : movement.movement}
            </div>
            <div className="w-10">
                <button
                    className="z-50 p-1 m-2 md-0 bg-gray-50 dark:bg-gray-900 text-red-500 hover:border-red-500 rounded-full"
                    onClick={handleDeleted}
                >
                    <XMarkIcon className="w-4 h-4" />
                </button>
            </div>
        </td>
    )
}

export default MovementMiniatureRow