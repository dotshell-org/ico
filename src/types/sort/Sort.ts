import { SummaryProperty } from "../summary/SummaryProperty.ts"
import { Orientation } from "./Orientation.ts";

export interface Sort {
    property: SummaryProperty,
    orientation: Orientation,
}