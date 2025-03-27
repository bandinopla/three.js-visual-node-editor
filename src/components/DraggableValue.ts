import { clamp } from "three/src/math/MathUtils.js";
import { Theme } from "../colors/Theme";
import { InteractiveLayoutElement } from "../layout/InteractiveLayoutElement";

export class DraggableValue extends InteractiveLayoutElement {

    protected _value = 0;  
    private dragOriginX = 0; 

    constructor( readonly name:string, readonly usesBar:boolean, readonly min:number, readonly max:number, protected step:number, protected onChange?:( percent:number, value:number )=>void )
    {
        super(); 
        this.xPadding=10
    } 

    get stringValue() {
        let v = ( this.min + (this.max-this.min) * this.value );

        v = clamp(  Math.floor(v/this.step) * this.step, this.min, this.max );
        
        if( this.step )
        {
            return Math.round(this.step)==this.step? v.toString() : v.toFixed(2) ;
        }

        return v.toFixed(2);
    } 

    /**
     * The percent value from 0 to 1
     */
    get value() {
        return this._value;
    }
    set value( v:number ) { 

        const oldValue = this._value;
        this._value = clamp( v , 0, 1);  
        if( oldValue!=this._value )
            this.onChange?.( this._value, this.min + Math.floor(((this.max-this.min)*this._value)/this.step)*this.step );

    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
          
        ctx.save();  
        
        this.roundedRect(ctx, 0,0, maxWidth, maxHeight , 3); 

        ctx.clip(); // Create the clipping region.

        // Draw the background.
        ctx.fillStyle = Theme.config.barBgColor;
        ctx.fillRect(0, 0, maxWidth, maxHeight);

        if( this.usesBar )
        {
            // Draw the progress bar fill.
            ctx.fillStyle = Theme.config.barFillColor;
            ctx.fillRect(0, 0, maxWidth * this.value, maxHeight); 
        }
        
        ctx.restore();  

        this.writeText( ctx, this.name, this.fontSize, this.xPadding, this.rowHeight,  Theme.config.barTextColor, "left");
        this.writeText( ctx, this.stringValue, this.fontSize, maxWidth-this.xPadding, this.rowHeight,  Theme.config.barTextColor, "right"); 
 
    }

    override onMouseMove(deltaX: number, deltaY: number): void {
        this.dragOriginX += deltaX;
 
        this.value = this.dragOriginX / this.hitArea.w  ;
 

    }
    override onMouseDown(cursorX: number, cursorY: number): void {
        //this.isDragging = true;
        this.dragOriginX = cursorX;
    }
    // override onMouseUp(): void {
    //     this.isDragging = false;
    // }
    override onMouseWheel(deltaY: number): void {

        const inc = this.step? this.step / (this.max-this.min) : 0.01;

        this.value = clamp( this.value-inc*(deltaY>0?1:-1), 0, 1 );
    }
}