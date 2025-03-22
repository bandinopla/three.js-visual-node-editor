import { Editor, Outlet } from "../Editor";
import { BaseNode } from "./BaseNode";
import { WinProperty } from "./WinProperty";

export class WinNode extends BaseNode {

    editor?:Editor

    protected headerColor:CanvasFillStrokeStyles["fillStyle"] = '#2b652b'

    width = 200; 
    fontSize = 16;
    childsHeight = 20;

    childs:WinProperty[] = []

    constructor( readonly name:string = "not set") {
        super();
    }

    get headerHeight() {
        return this.fontSize + 10
    }

    get height () {
        return this.headerHeight + this.childs.length * this.childsHeight;
    }

    

    override draw(ctx: CanvasRenderingContext2D): void {
        
        ctx.translate( this.x, this.y );  

        // Shadow properties
        ctx.shadowOffsetX = 1; // Horizontal offset of the shadow
        ctx.shadowOffsetY = 3; // Vertical offset of the shadow
        ctx.shadowBlur = 4;    // Blur radius of the shadow
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)'; // Color of the shadow (semi-transparent black)

        this.roundedRect(ctx, 0, 0, this.width, this.height, 5); // Draws a square with rounded corners.
        ctx.fillStyle = '#303030';
        ctx.fill(); 

        ctx.shadowColor = 'transparent'; //Or, you can reset all shadow properties.

        ctx.strokeStyle = 'black';
        ctx.lineWidth = 0.5;
        ctx.stroke();

        this.roundedRect(ctx, 1, 1, this.width-2, this.fontSize+5, 5); // Draws a square with rounded corners.
        ctx.fillStyle = this.headerColor;
        ctx.fill(); 
 
        ctx.fillStyle = "white";
        ctx.font = this.fontSize+'px Arial red';
        ctx.fillText( this.name, 10, this.fontSize);

        ctx.translate(0, this.headerHeight );

        /// draw childs....
        this.childs.forEach( child => {

            child.draw( ctx, this.width, this.childsHeight );

            ctx.translate(0, this.childsHeight );
        });

    }

    pressetOutlet( localX:number, localY:number, onOutletPressed:(outlet:Outlet)=>void ):boolean
    {  
        let ratio = 10;

        // for each child check if we hit an outlet...
        for (let i = 0; i < this.childs.length; i++) {
            const child = this.childs[i];
            
            const y = this.headerHeight + (i*this.childsHeight) + this.childsHeight/2;

            if( child.usesInput )
            { 
                if( Math.abs(localX)<=ratio && Math.abs( y-localY)<=ratio )
                {
                    onOutletPressed({
                        child: this,
                        dir: { x:-1, y:0 },
                        x: 0,
                        y,
                        isInput: true
                    });

                    return true;
                }
            }

            if( child.usesOutput )
            {
                if( Math.abs(this.width-localX)<=ratio && Math.abs( y-localY)<=ratio )
                    {
                        onOutletPressed({
                            child: this,
                            dir: { x:1, y:0 },
                            x: this.width,
                            y,
                            isInput: false
                        });
    
                        return true;
                    }
            }
            
        }

        return false;
    }
}