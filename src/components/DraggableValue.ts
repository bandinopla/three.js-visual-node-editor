import { clamp } from "three/src/math/MathUtils.js";
import { Theme } from "../colors/Theme";
import { InteractiveLayoutElement } from "../layout/InteractiveLayoutElement";

export class DraggableValue extends InteractiveLayoutElement {

    protected _value = 0;  
    protected _percent = 0;
    private dragOriginX = 0; 
    private size = 0;
    private promptValueOnMouseUp = false;

    constructor( readonly name:string, readonly usesBar:boolean, readonly min:number, readonly max:number, protected step:number, protected onChange?:( value:number, percent:number )=>void )
    {
        super(); 
        //this.xPadding=10
        this.size = max-min;
    } 

    get stringValue() {
        let v = this.value;
        
  
        return Math.round(v)==v? v.toString() : v.toFixed(2) ;
    } 

    /**
     * value of the slider, between min and max
     */
    get value() {
        return this._value;
    }
    set value( v:number ) { 

        const oldValue = this._value;

        this._value = clamp( v , this.min, this.max ); 
        this._percent = (this._value-this.min) / this.size ;

        if( oldValue!=this._value )
            this.onChange?.( this._value, this._percent ); 
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
            ctx.fillRect(0, 0, maxWidth * this._percent, maxHeight); 
        }
        
        ctx.restore();  

        ctx.translate(5, 0);
        maxWidth-= 10;

        if( this.name=="" )
        { 
            this.writeText( ctx, this.stringValue, this.fontSize, maxWidth/2, this.rowHeight,  Theme.config.barTextColor, "center"); 
        }
        else 
        {
            this.writeText( ctx, this.name, this.fontSize, this.xPadding, this.rowHeight,  Theme.config.barTextColor, "left");
            this.writeText( ctx, this.stringValue, this.fontSize, maxWidth-this.xPadding, this.rowHeight,  Theme.config.barTextColor, "right"); 
        }
        

 
    }

    override onMouseMove(deltaX: number, deltaY: number): void {
        this.dragOriginX += deltaX;
 
        if( this.usesBar )
        {
            this.value = this.min + (this.dragOriginX / this.hitArea.w) * this.size  ;
        }
        else 
        {
            this.value += this.step * deltaX>0? 1 : -1
        }  

        this.promptValueOnMouseUp = false;
    }

    override onMouseDown(cursorX: number, cursorY: number): void { 
        this.dragOriginX = cursorX;
        this.promptValueOnMouseUp = true;
    }

    override onMouseUp(): void { 
        if( this.promptValueOnMouseUp )
        {

            const val = prompt("Enter the new value...", this._value.toString() );
            if( val && !isNaN( Number(val) ) )
            {
                this.value = Number(val) ;
            }

        } 
    }

    override onMouseWheel(deltaY: number): void {
  
        this.value = this.value-this.step*(deltaY>0?1:-1);
    }
}