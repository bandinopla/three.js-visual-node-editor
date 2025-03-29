import { Theme } from "../colors/Theme"; 
import { IOutlet } from "../core/IOutlet";
import { isOutlet } from "../core/isOutlet";
import { Editor } from "../Editor";
import { IScript } from "../export/IScript";
import { Script } from "../export/Script"; 
import { Layout } from "../layout/Layout"; 
import { LayoutElement } from "../layout/LayoutElement";

export class Node extends LayoutElement implements IScript { 

    editor!:Editor;
    canBeDeleted = true;
    
    /**
     * Mostly used to visually show a sign that this node is selected
     */
    selected = false;

    x = 0
    y = 0

    get nodeName():string {
        throw new Error("Not implemented...")
    }
    
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

        this.recalculateOutlets();
    }

    /**
     * based on the current state of the node (it's layout) scan for the outlets available.
     */
    recalculateOutlets() {
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

        ctx.strokeStyle = this.selected? Theme.config.selectionBoxColor : 'black';
        ctx.lineWidth = this.selected? 1 : 0.5;
        ctx.stroke();
    }

    /**
     * Iterate over each outlet in this node (being IN or OUT sockets)
     * Optionally, if the `visitor` returns something, return whatever it returned on the first truthy return.
     */
    forEachOutlet<R>( visitor:(outlet:IOutlet, index: number)=>R ):R|void
    {
        //this._outlets.forEach(visitor);
        for (let i = 0; i < this._outlets.length; i++) {
            const outlet = this._outlets[i];
            const result = visitor( outlet, i );
            console.log("RESULT = ", result)
            if( result !== null && result !== undefined ) return result; 
        }
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
     * when overriding this, call super.update at the end...
     */
    override update() {
        this.forEachOutlet( outlet => {
            if( !outlet.isInput && isOutlet(outlet.connectedTo) )
            {
                outlet.connectedTo.owner.update();
            }
        })
    }

    writeScript( script:Script ):string {
        throw new Error(`Someone forgot to implement meeeeeeeee... and it was not meeeeeee.....`)
    }

    /**
     * return an object that will be JSON serialized that represent the current state of this node.
     */
    serialize():Record<string, any> {
        return { x:this.x, y:this.y }
    }
    
    /**
     * Restore the state of the object from data previusly created from calling `serialize()`
     */
    unserialize( data:Record<string, any> ) {
        this.x = data.x;
        this.y = data.y;
    }

    onRemoved() {
        
    }
}