import { FillStyle, Theme } from "../colors/Theme";
import { CanvasElement } from "../core/CanvasElement";

export class LayoutElement extends CanvasElement {

    private _parent:LayoutElement|undefined;
    private _fontSize? :number;
    private _fontColor? :FillStyle;
    private _rowHeight? :number ;

    /**
     * Used to return the height of this element to the layout. If true it will return the nodeRowHeight defined in the theme, else
     * it will asume the element will be in charge of informing it's own height.
     */
    protected singleLine = false;

    grow = 0;

    get parent() {
        return this._parent;
    }
    set parent(newParent:LayoutElement|undefined) {
        this._parent = newParent;
    } 

    get root():LayoutElement {
        return this.parent? this.parent.root : this;
    }

    set fontColor( color:FillStyle ) { this._fontColor = color; }
    get fontColor() { return this._fontColor ?? this._parent?.fontColor ?? Theme.config.textColor; } 

    set fontSize( fsize:number ) { this._fontSize = fsize; }
    get fontSize() { return this._fontSize ?? this._parent?.fontSize ?? Theme.config.fontSize; } 

    set rowHeight( rowHeight:number ) { this._rowHeight = rowHeight }
    get rowHeight() { return this._rowHeight ?? this._parent?.rowHeight ?? Theme.config.nodeRowHeight }


    /**
     * Return the size...
     */
    height( ctx:CanvasRenderingContext2D ):number
    { 
        return this.singleLine? Theme.config.nodeRowHeight : 0;
    }

    width( ctx:CanvasRenderingContext2D ) {
        return 0;
    }

    /**
     * We blindly render ourselves
     */
    render( ctx: CanvasRenderingContext2D, maxWidth:number, maxHeight:number )
    {

    }

    traverse( visitor:(elem:LayoutElement)=>void ) {
        if( !this.enabled ) return
        visitor( this ); 
    }
    
}