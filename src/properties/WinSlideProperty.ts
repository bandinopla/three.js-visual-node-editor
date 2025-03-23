import { DraggableProperty } from "./DraggableProperty"; 

export class WinSlideProperty extends DraggableProperty
{
    constructor( name:string, min:number, max:number ) {
        super(name, true, min, max) 
    }

   
 
}