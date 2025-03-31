import { FillStyle, Theme } from "../colors/Theme";
import { LayoutElement } from "./LayoutElement";
import { LayoutSorter } from "./LayoutSorter";

export type LayoutDirection = "row" | "column";
export type LayoutJustify = "start" | "end" | "space-around" | "space-between";
export type LayoutAlign = "start" | "end" | "center" | "stretch" ;


export type LayoutConfig = {
    direction: LayoutDirection,

    /**
     * Align on the MAIN-AXIS direction
     */
    justify: LayoutJustify,

    /**
     * Align on the CROSS-AXIS direction
     */
    align:LayoutAlign
    gap:number 
    width?:number,
    lineHeight?:number,
    bgColor?:FillStyle
    xPadding?:number,
    overflowHidden?:boolean,
    maxHeight?:number,
    scrollYSpeed:number
}

export class Layout extends LayoutElement {

    private renderer :LayoutSorter;
    private config: LayoutConfig ;

    /**
     * The last known height given to us by the render function.
     */
    private renderedHeight = 0;

    /**
     * Height of the childrens. Calculated by the last call to `.height()`
     */
    private _childsHeight = 0;

    /**
     * Offset to render the contents...
     */
    private _offsetY = 0;

    constructor( readonly childs:LayoutElement[], config:Partial<LayoutConfig> ) {
        super();

        this.config = {
            direction:"row",
            justify:"start",
            align:"start",
            gap: 0,
            scrollYSpeed: 1,
            ...config
        };

        this.xPadding = this.config.xPadding ?? 0;

        if( this.config.lineHeight )
        {
            this.rowHeight = this.config.lineHeight;
        }

        if( this.config.bgColor ) this.backgroundColor = this.config.bgColor;

        const cfg = this.config; 

        childs.forEach( child=>child.parent=this );

        if( cfg.direction=="row" ) 
        {
            this.renderer = new LayoutSorter( 
                1, 
                cfg.justify, 
                cfg.align,

                (ctx,elem)=>elem.width(ctx),
                (w, h)=>w, 

                (ctx,elem)=>elem.height(ctx),
                (w, h)=>h, 

                (ctx, elem, size, crossOffset, crossSize, startMargin, endMargin )=>{

                    if( elem ) {
                        ctx.save();
                        ctx.translate( startMargin, crossOffset);

                        this.renderElement( ctx, elem, size , crossSize );

                        ctx.restore();
                    };
                    ctx.translate( size+startMargin+endMargin, 0 );
                },

                cfg.gap
            )
        }
        else 
        {
            this.renderer = new LayoutSorter( 
                1, 
                cfg.justify, 
                cfg.align,

                (ctx,elem)=>elem.height(ctx),
                (w, h)=>h, 

                (ctx,elem)=>elem.width(ctx),
                (w, h)=>w, 

                (ctx, elem, size, crossOffset, crossSize, startMargin, endMargin )=>{

                    if( elem ) {
                        ctx.save();
                        ctx.translate( crossOffset, startMargin);
                        this.renderElement( ctx, elem, crossSize, size );
                        ctx.restore();
                    };
                    ctx.translate( 0, size+startMargin+endMargin );
                },

                cfg.gap
            )
        }
    } 

    get direction(){ return this.config.direction; }

    get enabledChilds() {
        return this.childs.filter(c=>c.enabled);
    }

    override height(ctx: CanvasRenderingContext2D) {

        let height = 0;

        if( this.config.direction=="row" )
        { 
            //
            // if we are a row, calculate the max height 
            //
            height = this.enabledChilds.reduce( (max, child)=>Math.max( max, child.height(ctx) ), 0);
        } 
        else 
        {
            //
            // if we are a column, we add up all heights.
            //
            height = this.enabledChilds.reduce( (total, child)=>total+child.height(ctx), 0)  + this.config.gap*this.childs.length + this.config.gap;
        }

        this._childsHeight = height;

        if( this.config.maxHeight )
            height = Math.min( this.config.maxHeight, height );

        return height;
        
    }

    override width(ctx: CanvasRenderingContext2D) {

        if( this.config.width ) return this.config.width;

        if( this.config.direction=="column" )
        {
            //el tema es que si el parent es row... hay que pasarle un ancho fijo...

            //return 0 //this.enabledChilds.reduce( (max, child)=>Math.max( max, child.width(ctx) ), 0);
            return this.enabledChilds.reduce( (max, child)=>Math.max( max, child.width(ctx) ), 0);
        }
    
        return this.getChildsWidth(ctx) ;
    }

    protected getChildsWidth(ctx: CanvasRenderingContext2D) {
        return this.enabledChilds.reduce( (total, child)=>total+child.width(ctx), 0) + this.config.gap*this.childs.length + this.config.gap;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
 
        if( !maxWidth )
        {
            maxWidth = this.getChildsWidth(ctx)
        }

        if( this.config.overflowHidden )
        {
            ctx.beginPath();
            ctx.rect(0,0,maxWidth, maxHeight);
            ctx.clip()
        }

        this.renderedHeight = maxHeight;
        
        super.render(ctx, maxWidth, maxHeight)
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
 
        ctx.save(); 

        ctx.translate(0, this._offsetY);
        this.renderer.render(ctx, this.enabledChilds, maxWidth, maxHeight ); 

        ctx.restore()
    }

    protected renderElement( ctx: CanvasRenderingContext2D, element:LayoutElement, maxWidth:number, maxHeight:number ) {

        element.render( ctx, maxWidth, maxHeight );

    }
 
    override traverse<T>(visitor: (elem: LayoutElement) => T): T | void {
        if( !this.enabled ) return;
        
        const result = super.traverse( visitor );
        if( result ) return result;
        
        for (const child of this.enabledChilds) {
            const childResult = child.traverse(visitor);
            if( childResult ) return childResult;
        }
    }

    scrollContent( deltaY:number )
    {
        this._offsetY += (deltaY>0? -1 : 1)*10*this.config.scrollYSpeed;

        if( this.renderedHeight )
        {
            // minimum value
            const minY = -this._childsHeight + this.renderedHeight;

            if( this._offsetY<minY ) {
                this._offsetY = minY;
            }
            else if ( this._offsetY>0 ) 
            {
                this._offsetY = 0;
            }
        }
    }
}

export class Row extends Layout
{
    constructor( childs:LayoutElement[], config?:Partial<Omit<LayoutConfig, "direction">> ){
        super( childs, {
            direction:"row",
            ...config
        })
    }
}

export class Column extends Layout
{
    constructor( childs:LayoutElement[], config?:Partial<Omit<LayoutConfig, "direction">> ){
        super( childs, {
            direction:"column",
            ...config
        })
    }
}