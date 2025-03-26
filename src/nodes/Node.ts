import { Theme } from "../colors/Theme";
import { CanvasElement } from "../core/CanvasElement";
import { IOutlet } from "../core/IOutlet";
import { isOutlet } from "../core/isOutlet";
import { Editor } from "../Editor";
import { Layout } from "../layout/Layout"; 
import { LayoutElement } from "../layout/LayoutElement";

export class Node extends LayoutElement { 

    editor!:Editor;
    canBeDeleted = true;

    x = 0
    y = 0
    
    override width(ctx: CanvasRenderingContext2D): number {
        return 150;
    }

    protected _outlets:IOutlet[] = [];

    constructor( layout:Layout ) {
        super(); 
        
        this.layout = layout;
             layout.parent = this; 
    }

    height( ctx: CanvasRenderingContext2D ) {
        return this.layout!.height( ctx ) + 5;
    }

    draw( ctx: CanvasRenderingContext2D ) {

        // our position
        ctx.translate( this.x, this.y );  

        // each child will have a width and a height....
        const height = this.height(ctx);

        this.renderPanelBox(ctx, height); 

        // render each child...
        this.render( ctx, this.width(ctx), height ); 

        //
        // collect outlets... because they can be enabled or disabled, who knows... every render we re-collect.
        //
        this._outlets.length = 0;
        this.layout!.traverse( elem => {

            if( isOutlet(elem) )
            {
                this._outlets.push( elem );
            }

        });
    }

    protected renderPanelBox( ctx: CanvasRenderingContext2D, height:number ) 
    {
        // // Shadow properties
        // ctx.shadowOffsetX = 1; // Horizontal offset of the shadow
        // ctx.shadowOffsetY = 3; // Vertical offset of the shadow
        // ctx.shadowBlur = 4;    // Blur radius of the shadow
        // ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Color of the shadow (semi-transparent black)
        this.boxShadow(ctx, 4);

        this.roundedRect(ctx, 0, 0, this.width(ctx), height, Theme.config.nodeBorderRadius ); // Draws a square with rounded corners.
        ctx.fillStyle = Theme.config.nodeWinBgColor;
        ctx.fill(); 

        //ctx.shadowColor = 'transparent'; //Or, you can reset all shadow properties.
        this.boxShadow(ctx, 0);

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5;
        ctx.stroke();
    }

    forEachOutlet( visitor:(outlet:IOutlet, index: number)=>void )
    {
        this._outlets.forEach(visitor);
    }

    /**
     * Return true if the global mouse position is over an outlet
     * @param globalX 
     * @param globalY 
     * @param onOutletHit call this callback if we are
     * @returns 
     */
    getOutletUnderMouse( globalX:number, globalY:number, onOutletHit?:( outlet:IOutlet )=>void )
    {
        let hitAreaRatio = 10;
        

        //
        // for each outlet of this node....
        //
        for (let i = 0; i < this._outlets.length; i++) {
            const outlet = this._outlets[i]; 
             
            //
            // if mouse is inside the hit area....
            //
            if( Math.abs( globalX - outlet.globalX )<=hitAreaRatio && Math.abs( globalY - outlet.globalY )<=hitAreaRatio )
            { 

                console.log("OUTLET!!", outlet.globalX, globalX, outlet.globalY, globalY )

                onOutletHit?.( outlet );
                return true;
            }

        }

        return false;
    } 

    /**
     * Inform our output nodes that something has changed...
     */
    protected somethingChanged() {
        this.forEachOutlet( outlet => {
            if( !outlet.isInput && isOutlet(outlet.connectedTo) )
            {
                outlet.connectedTo.owner.somethingChanged();
            }
        })
    }
}