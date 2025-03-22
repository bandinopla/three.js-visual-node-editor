import { WinProperty } from "./WinProperty";

export class WinIntProperty extends WinProperty { 
    constructor( name:string, readonly min:number, readonly max:number ) {
        super(name)
        this.hasOutput = false;
    }

    protected override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        
        ctx.save(); 

        let padding = 3;
        this.roundedRect(ctx, padding*2,padding, maxWidth-padding*4, maxHeight-padding*2, 5);
 

        ctx.clip(); // Create the clipping region.

        // Draw the background.
        ctx.fillStyle = "#545454";
        ctx.fillRect(0, 0, maxWidth, maxHeight); 

        this.drawLeftText( this.name, ctx, maxWidth, maxHeight, 10 )
        this.drawRightText( "1", ctx, maxWidth, maxHeight, 10 )

        ctx.restore();
    }
}