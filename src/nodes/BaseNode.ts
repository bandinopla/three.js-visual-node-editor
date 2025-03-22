export class BaseNode {
    x = 0
    y = 0

    draw(ctx: CanvasRenderingContext2D, maxWidth = 0, maxHeight = 0) {

    }

    protected roundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.arcTo(x + width, y, x + width, y + radius, radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
        ctx.lineTo(x + radius, y + height);
        ctx.arcTo(x, y + height, x, y + height - radius, radius);
        ctx.lineTo(x, y + radius);
        ctx.arcTo(x, y, x + radius, y, radius);
        ctx.closePath();
    }

    protected drawCircle(ctx: CanvasRenderingContext2D, x: number, y: number, radius: number, fillColor: CanvasFillStrokeStyles["fillStyle"], strokeColor: CanvasFillStrokeStyles["strokeStyle"], strokeWidth: number) {
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

    protected drawText(ctx: CanvasRenderingContext2D, text:string, x: number, y: number, size:number, color:CanvasFillStrokeStyles["fillStyle"], align:CanvasTextDrawingStyles["textAlign"] = "left")
    {
        ctx.fillStyle = color;
        ctx.textAlign = align;
        ctx.font = size+'px Arial';
        ctx.fillText( text, x, y);
    }
}