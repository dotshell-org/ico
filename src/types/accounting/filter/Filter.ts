import { SummaryProperty } from "../summary/SummaryProperty"
import { Operator } from "./Operator";

export interface Filter {
    property: SummaryProperty,
    operator: Operator,
    value: string | number;
}
