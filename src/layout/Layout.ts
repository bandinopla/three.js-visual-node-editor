import { FillStyle, Theme } from "../colors/Theme";
import { LayoutElement } from "./LayoutElement";
import { LayoutSorter } from "./LayoutSorter";

export type LayoutDirection = "row" | "column";
export type LayoutJustify = "start" | "end" | "space-around" | "space-between";
export type LayoutAlign = "start" | "end" | "center" | "stretch" ;


type LayoutConfig = {
    direction: LayoutDirection,
    justify: LayoutJustify,
    align:LayoutAlign
    gap:number 
}

export class Layout extends LayoutElement {

    private renderer :LayoutSorter;
    private config: LayoutConfig ;


    constructor( readonly childs:LayoutElement[], config:Partial<LayoutConfig> ) {
        super();

        this.config = {
            direction:"row",
            justify:"start",
            align:"start",
            gap: 0,
            ...config
        };

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

    get enabledChilds() {
        return this.childs.filter(c=>c.enabled);
    }

    override height(ctx: CanvasRenderingContext2D) {

        if( this.config.direction=="row" )
        {
            return this.enabledChilds.reduce( (max, child)=>Math.max( max, child.height(ctx) ), 0);
        }
 
        return this.enabledChilds.reduce( (total, child)=>total+child.height(ctx), 0)  + this.config.gap*this.childs.length + this.config.gap;
    }

    override width(ctx: CanvasRenderingContext2D) {
        if( this.config.direction=="column" )
        {
            return 0 //this.enabledChilds.reduce( (max, child)=>Math.max( max, child.width(ctx) ), 0);
        }
    
        return this.enabledChilds.reduce( (total, child)=>total+child.width(ctx), 0) + this.config.gap*this.childs.length + this.config.gap;
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {

        ctx.save(); 
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
}
