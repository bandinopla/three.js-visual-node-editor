import { clamp } from "three/src/math/MathUtils.js";
import { IHandlesMouse } from "../events/IHandlesMouse";
import { WinProperty } from "./WinProperty";
import { Theme } from "../colors/Theme";

export class DraggableProperty extends WinProperty implements IHandlesMouse
{
    protected value = .75;
    private isDragging = false;
    private width = 0;
    private height = 0;
    private dragOriginX = 0;
    protected step = 0;

    constructor( name:string, readonly usesBar:boolean, readonly min:number, readonly max:number ) {
        super(name)
        this.hasOutput = false;
        this.textColor = Theme.color.barTextColor;
    }  

    get stringValue() {
        const v = ( this.min + (this.max-this.min) * this.value );

        if( this.step )
        {
            return Math.round(v).toString();
        }

        return v.toFixed(2);
    }

    protected override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {

        this.width = maxWidth;
        this.height = maxHeight;
        
        ctx.save(); 

        let padding = 3;
        this.roundedRect(ctx, padding*2,padding, maxWidth-padding*4, maxHeight-padding*2, 5); 

        ctx.clip(); // Create the clipping region.

        // Draw the background.
        ctx.fillStyle = Theme.color.barBgColor;
        ctx.fillRect(0, 0, maxWidth, maxHeight);

        if( this.usesBar )
        {
            // Draw the progress bar fill.
            ctx.fillStyle = Theme.color.barFillColor;
            ctx.fillRect(0, 0, maxWidth* this.value, maxHeight); 
        }
        
        ctx.restore(); 


        this.drawLeftText( this.name, ctx, maxWidth, maxHeight, 10 )
        this.drawRightText( this.stringValue, ctx, maxWidth, maxHeight, 10 )
    }

    onMouseWheel(deltaY: number): void {

        const inc = this.step? 1/(this.max-this.min) : 0.01;

        this.value = clamp( this.value-inc*(deltaY>0?1:-1), 0, 1 );
    }
    onMouseMove(deltaX: number, deltaY: number): void { 
 
        this.dragOriginX += deltaX;
        this.value = this.dragOriginX / this.width
    }
    onMouseDown(cursorX: number, cursorY: number): void { 
        this.isDragging = true;
        this.dragOriginX = cursorX;
    } 
    onMouseUp(): void {
        this.isDragging = false;
    }
}