import { SummaryProperty } from "../SummaryProperties.ts"
import { FilterType } from "./FilterType.ts";

export interface Filter {
    property: SummaryProperty,
    type: FilterType,
    value: string | number;
}