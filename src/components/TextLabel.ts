import { Theme } from "../colors/Theme"; 
import { LayoutElement } from "../layout/LayoutElement";

export class TextLabel extends LayoutElement
{ 

    constructor( public label:string )
    {
        super();
    } 

    override width(ctx: CanvasRenderingContext2D): number { 
        ctx.font = this.fontSize+'px '+Theme.config.fontFamily
        return 100//ctx.measureText(this.label).width ;
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
          
        this.drawClipped(ctx, maxWidth, maxHeight, 
            ()=>this.writeText(ctx, this.label, this.fontSize, 0, maxHeight, Theme.config.textColor )
        ) 
    } 
}