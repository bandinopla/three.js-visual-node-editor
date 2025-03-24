import { LayoutAlign, LayoutJustify } from "./Layout";
import { LayoutElement } from "./LayoutElement";

export class LayoutSorter {
    private halfgap:number;

    constructor(
        protected direction:number,
        protected justify:LayoutJustify,
        protected align:LayoutAlign,
        protected getSize:(ctx:CanvasRenderingContext2D, elem:LayoutElement)=>number, 
        protected getMaxSize: (w:number, h:number)=>number, 
        protected getCrossSize:(ctx:CanvasRenderingContext2D, elem:LayoutElement)=>number, 
        protected getMaxCrossSize: (w:number, h:number)=>number, 

        protected renderElement: (ctx:CanvasRenderingContext2D, elem:LayoutElement|undefined, size:number, crossOffset:number, crossSize:number, startMargin:number, endMargin:number )=>void,
        protected gap = 0
    ) 
    { 
        this.halfgap = gap/2;
    }

    render( ctx: CanvasRenderingContext2D, childs:LayoutElement[], maxWidth:number, maxHeight:number )
    {  
        const maxSize = this.getMaxSize(maxWidth, maxHeight) ;
        const maxCrossSize = this.getMaxCrossSize(maxWidth, maxHeight);

 
        //
        // undefined & childs with no size will mean a wildcard width
        //
        const items = childs.reduce<(LayoutElement|undefined)[]>( (bag, child, i, arr)=>{

            if( i==0 && ( this.justify=="end" || this.justify=="space-around" ) )
            {
                bag.push(undefined);
            }
            
            bag.push( child );

            let lastChild = i+1==arr.length;

            if( this.justify=="space-around"  || ( this.justify=="space-between" && !lastChild ) )
            {
                bag.push(undefined);
            }

            return bag;
        },[]);

        //
        // spread "non fixed" space among the wildcards
        //
        let unknowns = 0;
        let knownSize = 0;

        items.forEach( (elem, i, arr) => {

            const w = elem? this.getSize(ctx, elem) : 0; 

            if( !w )
            {
                unknowns++;
            }
            else 
            {
                knownSize += w + this.gap + (i==0 || i+1==arr.length? this.halfgap : 0) ; // gap is a fixed space between all items.
            } 

        }); 

        const fillWidth = ( maxSize - knownSize ) / unknowns;  

        //
        // now we have a size for each item across the main axis, yeyyyyyyyyyyy!!
        //
        items.forEach( (elem, i, arr)=>{  

            const isFirst = i==0;
            const isLast = i+1==arr.length;
            const size = elem? this.getSize(ctx, elem) : 0;

            const crossSize = this.align=="stretch"? maxCrossSize : (elem? this.getCrossSize(ctx, elem) : 0) || maxCrossSize;
            const crossFreeSize = maxCrossSize - crossSize;
            const crossOffset = crossFreeSize * ( this.align=="end"? 1 : this.align=="center" ? 0.5 : 0 );

            //
            // this will advance the canva's cursor....
            //
            this.renderElement( 
                ctx, 
                elem, 
                size || fillWidth, 
                crossOffset, 
                crossSize, 
                size? (isFirst? this.gap : this.halfgap) : 0, 
                size? (isLast? this.gap : this.halfgap) : 0
            );

        });

    }
}