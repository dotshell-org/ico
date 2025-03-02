import {Credit} from "../../types/detailed-credits/Credit.ts";
import CreditTable from "./tables/CreditTable.tsx";
import OtherMoneyCreditTable from "./tables/OtherMoneyCreditTable.tsx";

interface CreditEditorProps {
    credit: Credit
}

const CreditEditor: React.FC<CreditEditorProps> = ({ credit }) => {
    return (
        <div className="p-2">
            <h1 className="text-3xl mb-10 font-bold cursor-default">{credit.title}</h1>
            {credit.tableIds.map((id) => {
                return <>
                    <CreditTable id={id} />
                </>
            })}
            <OtherMoneyCreditTable id={credit.id} />
        </div>
    )
}

export default CreditEditor;