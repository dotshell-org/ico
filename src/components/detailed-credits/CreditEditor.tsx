import {Credit} from "../../types/detailed-credits/Credit.ts";
import {MoneyType} from "../../types/detailed-credits/MoneyType.ts";
import CreditTable from "./tables/CreditTable.tsx";

interface CreditEditorProps {
    credit: Credit
}

const CreditEditor: React.FC<CreditEditorProps> = ({ credit }) => {
    return (
        <>
            <h1 className="text-3xl mt-2 mb-10 font-bold cursor-default">{credit.title}</h1>
            {credit.types.map((type, index) => {
                if (type !== MoneyType.Other) {
                    return <CreditTable id={index} type={type} />
                }
            })}
        </>
    )
}

export default CreditEditor;