import { SummaryProperty } from "./SummaryProperties"

export interface Filter {
    property: SummaryProperty,
    value: string;
}