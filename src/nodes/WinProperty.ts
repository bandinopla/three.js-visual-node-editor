import { BaseNode } from "./BaseNode";

export class WinProperty extends BaseNode {

    protected hasInput = true;
    protected hasOutput = false;

    constructor( readonly name:string, readonly fsize = 12, readonly padding=11 ) {
        super();
    }

    get usesInput() {return this.hasInput; }
    get usesOutput() { return this.hasOutput; }

    draw(ctx: CanvasRenderingContext2D, maxWidth?: number, maxHeight?: number): void {
        
        // input
        if( this.hasInput )
            this.drawCircle(ctx, 0, maxHeight!/2, 5, "#63c763", "black", 1);
         

        // output
        if( this.hasOutput )
            this.drawCircle(ctx, maxWidth!, maxHeight!/2, 5, "#63c763", "black", 1);

        
        this.renderContents( ctx, maxWidth!, maxHeight! );
    } 

    protected drawLeftText( text:string, ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number, margin=0 ) {
        this.drawText(ctx, text, this.padding+margin, maxHeight/2 + this.fsize/3, this.fsize, "white" )
    }

    protected drawRightText( text:string, ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number, margin=0 ) {
        this.drawText(ctx, text, maxWidth - this.padding - margin, maxHeight/2 + this.fsize/3, this.fsize, "white", "right" ) 
    }


    protected renderContents( ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number )
    {
        if( this.hasInput )
            this.drawText(ctx, this.name, this.padding, maxHeight/2 + this.fsize/3, this.fsize, "white" )

        if( this.hasOutput)
            this.drawText(ctx, "Output", maxWidth - this.padding, maxHeight/2 + this.fsize/3, this.fsize, "white", "right" ) 
    }
}