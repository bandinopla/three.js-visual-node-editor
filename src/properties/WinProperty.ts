import { Theme } from "../colors/Theme";
import { BaseNode } from "../nodes/BaseNode";

export class WinProperty extends BaseNode {

    protected hasInput = true;
    protected hasOutput = false;
    protected textColor:CanvasFillStrokeStyles["fillStyle"] ;

    constructor( readonly name:string, readonly fsize = 12, readonly padding=11 ) {
        super();
        this.textColor = Theme.color.textColor;
    }

    get usesInput() {return this.hasInput; }
    get usesOutput() { return this.hasOutput; }

    draw(ctx: CanvasRenderingContext2D, maxWidth?: number, maxHeight?: number): void {
        
        // input
        if( this.hasInput )
            this.drawCircle(ctx, 0, maxHeight!/2, 5, Theme.color.vec4, Theme.color.borderColor, 1);
         

        // output
        if( this.hasOutput )
            this.drawCircle(ctx, maxWidth!, maxHeight!/2, 5, Theme.color.vec3, Theme.color.borderColor, 1);

        
        this.renderContents( ctx, maxWidth!, maxHeight! );
    } 

    protected drawLeftText( text:string, ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number, margin=0 ) {
        this.drawText(ctx, text, this.padding+margin, maxHeight/2 + this.fsize/3, this.fsize, this.textColor )
    }

    protected drawRightText( text:string, ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number, margin=0 ) {
        this.drawText(ctx, text, maxWidth - this.padding - margin, maxHeight/2 + this.fsize/3, this.fsize, this.textColor, "right" ) 
    }


    protected renderContents( ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number )
    {
        if( this.hasInput )
            this.drawLeftText( this.name, ctx, maxWidth, maxHeight )

        if( this.hasOutput)
            this.drawRightText( "Output", ctx , maxWidth, maxHeight ) 
    }
}