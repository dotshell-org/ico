import {SummaryProperty} from "../SummaryProperty";
import {Orientation} from "../../../accounting/sort/Orientation";

export interface Sort {
    property: SummaryProperty,
    orientation: Orientation,
}
