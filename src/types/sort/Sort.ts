import { SummaryProperty } from "../summary/SummaryProperty.ts"
import { SortType } from "./SortType.ts";

export interface Sort {
    property: SummaryProperty,
    type: SortType,
}