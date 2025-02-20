import { SummaryProperty } from "../SummaryProperties.ts"
import { SortType } from "./SortType.ts";

export interface Sort {
    property: SummaryProperty,
    type: SortType,
}