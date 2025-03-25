import { LayoutElement } from "./LayoutElement";
import { LayoutSorter } from "./LayoutSorter";

export type LayoutDirection = "row" | "column";
export type LayoutJustify = "start" | "end" | "space-around" | "space-between";
export type LayoutAlign = "start" | "end" | "center" | "stretch" ;

export class Layout extends LayoutElement {

    private renderer :LayoutSorter;

    constructor( readonly direction:LayoutDirection, readonly justify:LayoutJustify, readonly align:LayoutAlign, readonly childs:LayoutElement[], readonly gap = 0 ) {
        super();

        childs.forEach( child=>child.parent=this );

        if( direction=="row" ) 
        {
            this.renderer = new LayoutSorter( 
                1, 
                justify, 
                align,

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

                gap
            )
        }
        else 
        {
            this.renderer = new LayoutSorter( 
                1, 
                justify, 
                align,

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

                gap
            )
        }
    } 

    get enabledChilds() {
        return this.childs.filter(c=>c.enabled);
    }

    override height(ctx: CanvasRenderingContext2D) {

        if( this.direction=="row" )
        {
            return this.enabledChilds.reduce( (max, child)=>Math.max( max, child.height(ctx) ), 0);
        }
 
        return this.enabledChilds.reduce( (total, child)=>total+child.height(ctx), 0)  + this.gap*this.childs.length + this.gap;
    }

    override width(ctx: CanvasRenderingContext2D) {
        if( this.direction=="column" )
        {
            return 0 //this.enabledChilds.reduce( (max, child)=>Math.max( max, child.width(ctx) ), 0);
        }
    
        return this.enabledChilds.reduce( (total, child)=>total+child.width(ctx), 0) + this.gap*this.childs.length + this.gap;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {

        ctx.save();
        this.renderer.render(ctx, this.enabledChilds, maxWidth, maxHeight );
        ctx.restore()
    }

    protected renderElement( ctx: CanvasRenderingContext2D, element:LayoutElement, maxWidth:number, maxHeight:number ) {

        element.render( ctx, maxWidth, maxHeight );

    }

    // override traverse( visitor:(elem:LayoutElement)=>void ) {
        
    //     super.traverse( visitor );

    //     if( !this.enabled ) return
    //     this.enabledChilds.forEach( child=>child.traverse(visitor) );
    // }
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
