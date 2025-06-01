import {SummaryProperty} from "../SummaryProperty.js";
import {Orientation} from "../../../accounting/sort/Orientation.js";

export interface Sort {
    property: SummaryProperty,
    orientation: Orientation,
}
