import { SummaryProperty } from "../summary/SummaryProperty"
import { Orientation } from "./Orientation";

export interface Sort {
    property: SummaryProperty,
    orientation: Orientation,
}
