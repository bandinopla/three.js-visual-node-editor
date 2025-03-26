 
import { OutletSize } from "../core/IOutlet";
import { OutletProperty } from "./OutletProperty";

export class Output extends OutletProperty { 

    constructor( protected label:string, size:OutletSize )
    {
        super( false, size ); 
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void { 
        
        this.writeText(ctx, this.label, this.fontSize, maxWidth-10, maxHeight, this.fontColor, "right" );
 
        
    }
}