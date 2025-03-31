import { DraggableValue } from "./DraggableValue";

export class DraggableNumber extends DraggableValue {
    constructor( name:string ="" ) {
        super(name, false, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, 1 );
    }
}