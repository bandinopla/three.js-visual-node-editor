import { FillStyle, Theme } from "../colors/Theme";
import { CanvasElement } from "../core/CanvasElement";
import { Layout } from "./Layout";

export class LayoutElement extends CanvasElement {

    private _parent:LayoutElement|undefined;
    private _fontSize? :number;
    private _fontColor? :FillStyle;
    private _rowHeight? :number ;
    private _layout?:Layout;

    /**
     * Used to return the height of this element to the layout. If true it will return the nodeRowHeight defined in the theme, else
     * it will asume the element will be in charge of informing it's own height.
     */
    protected singleLine = true;

    grow = 0;
    xPadding = 0;
    backgroundColor?:FillStyle;
    boxShadowLevel?:number;

    protected get layout() { return this._layout; }
    protected set layout( customLayout:Layout|undefined ) {
        this._layout = customLayout;

        if( customLayout)
            customLayout.parent = this;
    }

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
        //if( this._layout ) return this._layout.height(ctx);
        return this.singleLine? this.rowHeight : 0;
    }

    width( ctx:CanvasRenderingContext2D ):number {
        //if( this._layout ) return this._layout.width(ctx) ;
        return 0;
    }

    /**
     * We blindly render ourselves
     */
    render( ctx: CanvasRenderingContext2D, maxWidth:number, maxHeight:number )
    { 
        this.boxShadow(ctx, this.boxShadowLevel ?? 0 );

        if( this.backgroundColor )
        {
            ctx.fillStyle = this.backgroundColor;
            ctx.fillRect(0,0,maxWidth, maxHeight);
        }

        if( this.xPadding )
        {
            ctx.translate(this.xPadding, 0)
        }

        this.renderContents( ctx, maxWidth-this.xPadding*2, maxHeight ); 

        this.boxShadow(ctx, 0);
    }

    /**
     * This is separated from `render` because renders is the one in charge of paddings, background and box shadows...
     * @param ctx 
     * @param maxWidth 
     * @param maxHeight 
     */
    protected renderContents( ctx: CanvasRenderingContext2D, maxWidth:number, maxHeight:number ) {
        this._layout?.render( ctx, maxWidth , maxHeight );
    }

    /**
     * Scan self adn each children. If the visitor function returns Truthy then return whatever it found. In that case this would behave similar to a `find` function.
     * If nothing is returned or nothing thruthy it will scan everything and ill behave like a `forEaach`
     * @param visitor 
     * @returns 
     */
    traverse<T>( visitor:(elem:LayoutElement)=>T ):T|void {
        if( !this.enabled ) return;
        
        const rtrn = visitor( this ); 

        if( rtrn ) return rtrn;

        if( this._layout ) return this._layout.traverse( visitor );
    }
    
}