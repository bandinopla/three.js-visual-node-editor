import { FillStyle, Theme } from "../colors/Theme";
import { IOutlet, OutletSize } from "../core/IOutlet";
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
    private _size = 1;

    get isInput() { return this._isInput; } 
    get globalX() { return this._globalX; }
    get globalY() { return this._globalY; }  

    readonly color:FillStyle;

    constructor( inputType:boolean, readonly size:OutletSize )
    {
        super();
        this._isInput = inputType;  
        
        this.color = [
            "black",
            Theme.config.vec1,
            Theme.config.vec2,
            Theme.config.vec3,
            Theme.config.vec4,
            Theme.config.materialOutputSocketColor,
        ][ size ]
    }

    isCompatible(other: IOutlet): boolean {
        return this.size == 5 || other.size==5? this.size==other.size : true
    }

    connectedTo?: IOutlet | undefined;

    get owner(): Node {
        return this.root as Node;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number)  {  
   
        //render circle...
        ctx.save()
        ctx.translate( this.isInput? 0 : maxWidth, maxHeight/2);
        this.drawCircle(ctx, 0, 0, 5, this.color, Theme.config.borderColor, 1);

        //
        // obtain the global position of the outlet
        // 
        const cursor = this.getGlobalCoordinate(ctx,0,0);  

        this._globalX = cursor.x;
        this._globalY = cursor.y; 

        ctx.restore(); 

        super.render(ctx, maxWidth,maxHeight)
        
    }
}