import { SummaryProperty } from "../summary/SummaryProperty.ts"
import { Operator } from "./Operator.ts";

export interface Filter {
    property: SummaryProperty,
    operator: Operator,
    value: string | number;
}