import { SummaryProperty } from "../summary/SummaryProperty.js"
import { Orientation } from "./Orientation.js";

export interface Sort {
    property: SummaryProperty,
    orientation: Orientation,
}
