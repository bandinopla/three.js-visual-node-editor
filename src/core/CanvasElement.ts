import { FillStyle, Theme } from "../colors/Theme";

export class CanvasElement {

    enabled = true;
    
    protected roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
     
        ctx.beginPath();
        ctx.roundRect(x, y, width, height, radius);
        // ctx.moveTo(x + radius, y);
        // ctx.lineTo(x + width - radius, y);
        // ctx.arcTo(x + width, y, x + width, y + radius, radius);
        // ctx.lineTo(x + width, y + height - radius);
        // ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        // ctx.lineTo(x + radius, y + height);
        // ctx.arcTo(x, y + height, x, y + height - radius, radius);
        // ctx.lineTo(x, y + radius);
        // ctx.arcTo(x, y, x + radius, y, radius);
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
 
}