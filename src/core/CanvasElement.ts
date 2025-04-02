import { FillStyle, Theme } from "../colors/Theme";

export class CanvasElement {

    /**
     * If it should be rendered or not
     */
    enabled = true;
    
    protected roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
     
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        ctx.closePath();
    }

    protected drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fillColor: FillStyle, strokeColor: FillStyle, strokeWidth: number) {
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI); // Create a circle path.

        if (fillColor) {
            ctx.fillStyle = fillColor;
            ctx.fill(); // Fill the circle.
        }

        if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = strokeWidth || 1; // Default stroke width is 1.
            ctx.stroke(); // Stroke the circle.
        }
    }

    protected drawText(ctx: CanvasRenderingContext2D, text:string, fsize:number, x: number, y: number, color:FillStyle, align:CanvasTextDrawingStyles["textAlign"] = "left")
    {
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.font = fsize+'px '+Theme.config.fontFamily; //---- this should be set elswere
        ctx.fillText( text, x, y);
    } 

    protected writeText( ctx: CanvasRenderingContext2D, text:string, fsize:number, x: number, lineHeght:number, color:FillStyle, align:CanvasTextDrawingStyles["textAlign"] = "left") 
    {
        this.drawText( ctx, text, fsize,
             x, 
             lineHeght/2 + fsize/3, // vertical align it to the center 
             color, align );
    }

    protected getGlobalCoordinate( ctx: CanvasRenderingContext2D, x=0, y=0 ) {
        return ctx.getTransform().transformPoint(new DOMPoint(x, y)); 
    }

    protected boxShadow(ctx: CanvasRenderingContext2D, elevation:number ) {
        if( elevation==0 )
        {
            ctx.shadowColor = 'transparent';
        }
        else 
        {
            // Shadow properties
            ctx.shadowOffsetX = 1; // Horizontal offset of the shadow
            ctx.shadowOffsetY = 3; // Vertical offset of the shadow
            ctx.shadowBlur = elevation;    // Blur radius of the shadow
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Color of the shadow (semi-transparent black)
        }
    }

    /**
     * Mask the draw to only be visible inside the square from 0,0 to width, height 
     */
    protected drawClipped(ctx: CanvasRenderingContext2D, width:number, height:number, draw:VoidFunction ){
        ctx.save() 
        
        try {  

            ctx.beginPath();
            ctx.rect(0, 0, width, height);
            ctx.clip();
            draw();

        } finally {
            ctx.restore(); 
        }
    }

}