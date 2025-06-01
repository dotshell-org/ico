import {SummaryProperty} from "../SummaryProperty";
import {Operator} from "./Operator";

export interface Filter {
    property: SummaryProperty,
    operator: Operator,
    value: string | number;
}
