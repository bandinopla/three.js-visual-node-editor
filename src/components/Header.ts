import { FillStyle, Theme } from "../colors/Theme";
import { LayoutElement } from "../layout/LayoutElement";

export class HeaderElement extends LayoutElement {
    constructor( protected title:string, protected bgColor:FillStyle )
    {
        super();
    }

    override height(ctx: CanvasRenderingContext2D): number {
        return this.fontSize + 5;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        
        this.roundedRect( ctx, 1, 1, maxWidth-2, this.height(ctx)-1, Theme.config.nodeBorderRadius-2 ); // Draws a square with rounded corners.
         
        ctx.fillStyle = this.bgColor;
        ctx.fill()
 

        this.writeText(ctx, this.title, this.fontSize, 10, maxHeight, this.fontColor );
    }
}