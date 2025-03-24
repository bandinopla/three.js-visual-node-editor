import { Theme } from "../colors/Theme";
import { IHandlesMouse } from "../events/IHandlesMouse";
import { BaseNode } from "../nodes/BaseNode";

export type HitArea = {
    x:number
    y:number
    w:number
    h:number
    handler:IHandlesMouse
}

export class WinProperty extends BaseNode {

    protected hasInput = true;
    protected hasOutput = false;
    protected textColor:CanvasFillStrokeStyles["fillStyle"] ;
    protected hitAreas:HitArea[] = [];

    constructor( readonly name:string, readonly fsize = 12, readonly padding=11 ) {
        super();
        this.textColor = Theme.config.textColor;
    }

    get usesInput() {return this.hasInput; }
    get usesOutput() { return this.hasOutput; }

    draw(ctx: CanvasRenderingContext2D, maxWidth?: number, maxHeight?: number): void {
        
        // input
        if( this.hasInput )
            this.drawCircle(ctx, 0, maxHeight!/2, 5, Theme.config.vec4, Theme.config.borderColor, 1);
         

        // output
        if( this.hasOutput )
            this.drawCircle(ctx, maxWidth!, maxHeight!/2, 5, Theme.config.vec3, Theme.config.borderColor, 1);

        
        this.renderContents( ctx, maxWidth!, maxHeight! );
    } 

    protected drawLeftText( text:string, ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number, margin=0 ) {
        this.drawText(ctx, text, this.padding+margin, maxHeight/2 + this.fsize/3, this.fsize, this.textColor )
    }

    protected drawRightText( text:string, ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number, margin=0 ) {
        this.drawText(ctx, text, maxWidth - this.padding - margin, maxHeight/2 + this.fsize/3, this.fsize, this.textColor, "right" ) 
    }

    protected drawButton(text:string, ctx: CanvasRenderingContext2D, x:number, y:number, maxWidth:number, maxHeight:number ) {

        ctx.font = this.fsize+'px '+Theme.config.fontFamily; 

        const textMetrics = ctx.measureText(text);
        const xPadding = 10; 
        const btnWidth = textMetrics.width+xPadding*2;

        this.roundedRect(ctx, x+this.padding, y, textMetrics.width+xPadding*2,maxHeight, 3);

        ctx.fillStyle = Theme.config.btnBgColor;
        ctx.fill();

        ctx.fillStyle = this.textColor;
        this.drawText(ctx, text, x+this.padding+xPadding, y+maxHeight/2 + this.fsize/3, this.fsize, this.textColor ) ;

        return {
            x, width:btnWidth, 
        }
    }


    protected renderContents( ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number )
    {
        if( this.hasInput )
            this.drawLeftText( this.name, ctx, maxWidth, maxHeight )

        if( this.hasOutput)
            this.drawRightText( "Output", ctx , maxWidth, maxHeight ) 
    }
}