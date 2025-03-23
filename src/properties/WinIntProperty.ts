import { DraggableProperty } from "./DraggableProperty"; 

export class WinIntProperty extends DraggableProperty { 
 

    constructor( name:string, min:number, max:number ) {
        super(name, false, min, max) 
        this.step = 1;
    }
 
    
}