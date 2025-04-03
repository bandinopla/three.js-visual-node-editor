import { FillStyle, Theme } from "../colors/Theme";
import { IOutlet, OutletSize } from "../core/IOutlet";
import { isOutlet } from "../core/isOutlet";
import { Script } from "../export/Script";
import { LayoutElement } from "../layout/LayoutElement";
import { Node } from "../nodes/Node"; 
import { positionWorld } from 'three/tsl';

let count = 0;

/**
 * A property that renders a tiny colored dot indicating a place to plug a pipe to connect nodes.
 */
export class OutletProperty extends LayoutElement implements IOutlet
{
    private _globalX = 0;
    private _globalY = 0;
    private _isInput = true;
    private _size = 1;
    private _connectedTo:IOutlet | undefined;
    private _outputProp?:string;

    /**
     * returns which prop of the owner's object we will return.
     * @param prop 
     * @returns 
     */
    outputProp( prop:string ){
        this._outputProp = prop;
        return this;
    }

    get isInput() { return this._isInput; } 
    get globalX() { return this._globalX; }
    get globalY() { return this._globalY; }  

    readonly color:FillStyle;
    private outletIndex = ++count;

    constructor( inputType:boolean, readonly size:OutletSize )
    {
        super();
        this._isInput = inputType;  
        
        this.color = [
            "white",
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
 
    get connectedTo(){ return this._connectedTo; }
    set connectedTo( other:IOutlet|undefined) {
        const oldOther = this._connectedTo;
        const changed = oldOther!==other;
        this._connectedTo = other; 
        if( changed ) {
            if( other ) 
            {
                this.onConnected( other );
            }
            else 
            {
                if( oldOther ) this.onDisconnected( oldOther )
            }
        }
    } 
    
    protected onConnected( to:IOutlet ) {}
    protected onDisconnected( from:IOutlet ){}

    get owner(): Node {
        return this.root as Node;
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number)  {  
   
        //render circle...
        ctx.save()

        const margin = Theme.config.nodeMargin;

        ctx.translate( this.isInput? -margin : maxWidth+margin, maxHeight/2);
        this.drawCircle(ctx, 0, 0, 5, this.color, Theme.config.borderColor, 1);

        //
        // obtain the global position of the outlet
        // 
        const cursor = this.getGlobalCoordinate(ctx,0,0);  

        this._globalX = cursor.x;
        this._globalY = cursor.y; 

        ctx.restore(); 

        ctx.translate( this.isInput? 0 : margin, 0);
        super.render(ctx, maxWidth,maxHeight)
        
    }

    /**
     * Name of the outlet, to be used when exporting to JS...
     */
    get outletName() {
        return this.owner.nodeName+"_"+(this.isInput?"in":"out")+"_"+this.outletIndex;
    }

    /**
     * We are called from right to left. So the order will always be output first then node then inputs...
     * @param script 
     * @returns 
     */
    writeScript(script: Script): string {
 

        if( this.connectedTo )
        {
            let otherNameRef :string;
            let needsToBeConverted = false;

            //
            // if we are an input node, we must ask the other node to write his script
            //
            if( this.isInput )
            {
                otherNameRef = this.connectedTo.writeScript( script );

                if( otherNameRef && this.connectedTo.size!=this.size ) {
                    otherNameRef += (this.size==1? ".toFloat" : 
                                                   ".toVec"+this.size) + "()";
                }
            }

            //
            // If we are an output node, we must ask OUR node to write it's script
            //
            else 
            {
                otherNameRef = this.owner.writeScript( script );
                if( this._outputProp )
                {
                    otherNameRef += "."+this._outputProp;
                }
            }

            //
            // conver the output of the other node to whatever size we are...
            //
            return otherNameRef;
        }
        else 
        {
            return "";
        }
    }
 
}