import { FillStyle } from "../colors/Theme"; 
import { OutletProperty } from "./OutletProperty";

export class Input extends OutletProperty {
    constructor(dotColor:FillStyle) {
        super(true, dotColor);
    }
}