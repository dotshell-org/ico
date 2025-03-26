import {SummaryProperty} from "../SummaryProperty.ts";
import {Orientation} from "../../../accounting/sort/Orientation.ts";

export interface Sort {
    property: SummaryProperty,
    orientation: Orientation,
}