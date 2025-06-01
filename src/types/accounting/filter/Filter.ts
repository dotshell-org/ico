import { SummaryProperty } from "../summary/SummaryProperty.js"
import { Operator } from "./Operator.js";

export interface Filter {
    property: SummaryProperty,
    operator: Operator,
    value: string | number;
}
