 
import { OutletSize } from "../core/IOutlet";
import { OutletProperty } from "./OutletProperty";

export class Output extends OutletProperty { 

    /** 
     * @param label Text to show next to the dot to name this outlet
     * @param size number components it will output
     * @param ownerProp the name of the owner's object that contains, or from which the components will be taken.
     */
    constructor( protected label:string, size:OutletSize, protected ownerProp?:string )
    {
        super( false, size ); 
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void { 
        
        ctx.save();
        ctx.rect(0,0,maxWidth, maxHeight);
        ctx.clip();
        this.writeText(ctx, this.label, this.fontSize, maxWidth-10, maxHeight, this.fontColor, "right" );
        ctx.restore();
        
    }
}