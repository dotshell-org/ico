import {SummaryProperty} from "../SummaryProperty.js";
import {Operator} from "./Operator.js";

export interface Filter {
    property: SummaryProperty,
    operator: Operator,
    value: string | number;
}
