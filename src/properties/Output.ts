import { FillStyle, Theme } from "../colors/Theme"; 
import { OutletProperty } from "./OutletProperty";

export class Output extends OutletProperty { 

    constructor( protected label:string, dotColor:FillStyle )
    {
        super( false, dotColor ); 
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void { 
        
        this.writeText(ctx, this.label, this.fontSize, maxWidth-10, maxHeight, this.fontColor, "right" );

        super.render(ctx, maxWidth, maxHeight);
        
    }
}