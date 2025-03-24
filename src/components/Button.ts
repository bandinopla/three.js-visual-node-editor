import { Theme } from "../colors/Theme";
import { LayoutElement } from "../layout/LayoutElement";

export class Button extends LayoutElement
{
    private xpadding = 5;

    constructor( protected label:string )
    {
        super();
        this.singleLine = true;
    }

    override width(ctx: CanvasRenderingContext2D): number {
      
        return ctx.measureText(this.label).width + this.xpadding*2;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        
        //background
        this.roundedRect(ctx, 0,0, maxWidth, maxHeight, 2);
        ctx.fillStyle = Theme.config.btnBgColor;
        ctx.fill();  

        //text
        this.writeText(ctx, this.label, this.fontSize, maxWidth/2, maxHeight, Theme.config.btnTextColor, "center");

    }
}