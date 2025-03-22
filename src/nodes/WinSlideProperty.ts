import { WinProperty } from "./WinProperty";

export class WinSlideProperty extends WinProperty
{
    constructor( name:string, readonly min:number, readonly max:number ) {
        super(name)
    }

    protected override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        
        ctx.save(); 

        let padding = 3;
        this.roundedRect(ctx, padding*2,padding, maxWidth-padding*4, maxHeight-padding*2, 5);
 

        ctx.clip(); // Create the clipping region.

        // Draw the background.
        ctx.fillStyle = "#545454";
        ctx.fillRect(0, 0, maxWidth, maxHeight);

        // Draw the progress bar fill.
        ctx.fillStyle = "#4772b3";
        ctx.fillRect(0, 0, maxWidth*.75, maxHeight);
        ctx.restore();

        this.drawLeftText( this.name, ctx, maxWidth, maxHeight, 10 )
        this.drawRightText( "0.75", ctx, maxWidth, maxHeight, 10 )
    }
 
}