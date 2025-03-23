import { t } from "i18next";

function StockDashboard() {

    return (
        <div className="pb-20">
            <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"📊 " + t("dashboard")}</h1>
        </div>
    );
}

export default StockDashboard;