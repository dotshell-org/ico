import {useEffect, useState} from "react";
import {t} from "i18next";
import {InvoiceProductLink} from "../../types/stock/InvoiceProductLink.ts";
import LinkMiniatureRow from "../../components/stock/links/LinkMiniatureRow.tsx";
import SetLinkInterface from "../../components/stock/links/SetLinkInterface.tsx";

interface StockLinksProps {

}

const StockLinks: React.FC<StockLinksProps> = ({  }) => {
    const [linkedFilter, setLinkedFilter] = useState<boolean | null>(null);
    const [links, setLinks] = useState<InvoiceProductLink[]>([]);

    const [selectedLink, setSelectedLink] = useState<InvoiceProductLink>({
        id: 0,
        name: "",
        date: "2000-00-00",
        quantity: 0,
        addition_id: 0
    });
    const [showSetLinkInterface, setShowSetLinkInterface] = useState<boolean>(false);

    useEffect(() => {
        (window as any).ipcRenderer
            .invoke("getStockLinks", linkedFilter)
            .then((result: InvoiceProductLink[]) => {
                setLinks(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching credits", error);
            });
    }, [linkedFilter]);

    const refreshLinks = () => {
        (window as any).ipcRenderer
            .invoke("getStockLinks", linkedFilter)
            .then((result: InvoiceProductLink[]) => {
                setLinks(result);
            })
            .catch((error: any) => {
                console.error("Error when fetching links", error);
            });
    };

    const handleRowClicked = (link: InvoiceProductLink) => {
        setSelectedLink(link);
        setShowSetLinkInterface(true);
    }

    return (
        <>
            <div className="fixed left-10 right-10 top-16 bg-white dark:bg-gray-950 pt-10">
                <h1 className="text-3xl mt-2 mb-2 font-bold cursor-default">{"🔗 " + t("links")}</h1>
                <select
                    className="w-52 p-0.5 mb-4 bg-gray-100 dark:bg-gray-900 rounded cursor-pointer"
                    onChange={(e) => setLinkedFilter(e.target.value === "true" ? true : e.target.value === "false" ? false : null)}
                    value={linkedFilter === null ? "null" : linkedFilter.toString()}
                >
                    <option value="null">🟨 {t("all")}</option>
                    <option value="false">❌ {t("unlinked")}</option>
                    <option value="true">✅ {t("linked")}</option>
                </select>
                <td
                    className={`py-2 mx-0.5 flex align-middle border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-950 border-b text-left p-1.5 text-sm font-bold transition-all select-none`}
                >
                    <div className="w-[70%]">
                        {t("object")}
                    </div>
                    <div className="w-[30%]">
                        {t("quantity_in_invoice")}
                    </div>
                    <div className="w-[20%]">
                        {t("linked")}
                    </div>
                </td>
            </div>

            <table className="w-full table-auto border-white dark:border-gray-950 border-2 border-y-0 mt-[8.2rem] ">
                {
                    links.map((link) => (
                        <>
                            <LinkMiniatureRow key={link.id} productLink={link} onClick={() => handleRowClicked(link)} />
                        </>
                    ))
                }
            </table>

            {showSetLinkInterface &&
                <SetLinkInterface
                    link={selectedLink}
                    onClose={() => setShowSetLinkInterface(false)}
                    onUpdate={refreshLinks}
                />}

        </>
    );
}

export default StockLinks;