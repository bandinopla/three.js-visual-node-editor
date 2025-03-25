import { clamp } from "three/src/math/MathUtils.js";
import { Theme } from "../colors/Theme";
import { InteractiveLayoutElement } from "../layout/InteractiveLayoutElement";

export class DraggableValue extends InteractiveLayoutElement {

    protected value = .75; 
    private _width = 0;
    private isDragging = false; 
    private dragOriginX = 0;

    constructor( readonly name:string, readonly usesBar:boolean, readonly min:number, readonly max:number, protected step:number, protected onChange?:( newValue:number)=>void )
    {
        super();
        this.singleLine = true;
    } 

    get stringValue() {
        let v = ( this.min + (this.max-this.min) * this.value );

        v = clamp(  Math.floor(v/this.step) * this.step, this.min, this.max );
        
        if( this.step )
        {
            return v.toString();
        }

        return v.toFixed(2);
    } 

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        
        this._width = maxWidth;

        ctx.save(); 

        let padding = 10;
        this.roundedRect(ctx, padding,0, maxWidth-padding*2, maxHeight , 3); 

        ctx.clip(); // Create the clipping region.

        // Draw the background.
        ctx.fillStyle = Theme.config.barBgColor;
        ctx.fillRect(0, 0, maxWidth, maxHeight);

        if( this.usesBar )
        {
            // Draw the progress bar fill.
            ctx.fillStyle = Theme.config.barFillColor;
            ctx.fillRect(0, 0, maxWidth* this.value, maxHeight); 
        }
        
        ctx.restore();  

        this.writeText( ctx, this.name, this.fontSize, padding*2, this.rowHeight,  Theme.config.barTextColor, "left");
        this.writeText( ctx, this.stringValue, this.fontSize, maxWidth-padding*2, this.rowHeight,  Theme.config.barTextColor, "right"); 

        //hit area...
        this.defineHitArea(ctx, 0,0,maxWidth,maxHeight); 
    }

    override onMouseMove(deltaX: number, deltaY: number): void {
        this.dragOriginX += deltaX;
        this.value = this.dragOriginX / this._width ;
    }
    override onMouseDown(cursorX: number, cursorY: number): void {
        this.isDragging = true;
        this.dragOriginX = cursorX;
    }
    override onMouseUp(): void {
        this.isDragging = false;
    }
    override onMouseWheel(deltaY: number): void {

        const inc = this.step? this.step / (this.max-this.min) : 0.01;

        this.value = clamp( this.value-inc*(deltaY>0?1:-1), 0, 1 );
    }
}