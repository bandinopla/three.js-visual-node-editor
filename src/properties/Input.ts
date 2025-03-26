import { FillStyle } from "../colors/Theme"; 
import { OutletSize } from "../core/IOutlet";
import { OutletProperty } from "./OutletProperty";

export class Input extends OutletProperty {
    constructor( size:OutletSize) {
        super(true, size);
    }
}