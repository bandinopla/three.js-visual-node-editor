import { FillStyle, Theme } from "../colors/Theme";
import { IOutlet } from "../core/IOutlet";
import { LayoutElement } from "../layout/LayoutElement";
import { Node } from "../nodes/Node";

/**
 * A property that renders a tiny colored dot indicating a place to plug a pipe to connect nodes.
 */
export class OutletProperty extends LayoutElement implements IOutlet
{
    private _globalX = 0;
    private _globalY = 0;
    private _isInput = true;

    get isInput() { return this._isInput; } 
    get globalX() { return this._globalX; }
    get globalY() { return this._globalY; }

    constructor( inputType:boolean, protected dotColor:FillStyle )
    {
        super();
        this._isInput = inputType;
        this.singleLine = true;
    }

    connectedTo?: IOutlet | undefined;

    get owner(): Node {
        return this.root as Node;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {  

        //render circle...
        ctx.save()
        ctx.translate( this.isInput? 0 : maxWidth, maxHeight/2);
        this.drawCircle(ctx, 0, 0, 5, this.dotColor, Theme.config.borderColor, 1);

        //
        // obtain the global position of the outlet
        //
        const matrix = ctx.getTransform(); 
        const point = new DOMPoint(0, 0);
        const cursor = matrix .transformPoint(point); 

        this._globalX = cursor.x;
        this._globalY = cursor.y; 

        ctx.restore();
        
    }
}