import { FillStyle, Theme } from '../colors/Theme';
import {
    IOutlet,
    DataSize,
    IDataType,
    DataType,
    DataSize2Color,
} from '../core/IOutlet';
import { Script } from '../export/Script';
import { LayoutElement } from '../layout/LayoutElement';
import { Node } from '../nodes/Node';

let count = 0;

export type OutletEvents = {
    typeChange: { newType: IDataType };
    connected: { to: IOutlet };
    disconnected: { from: IOutlet };
    renamed: { newName: string };
};

/**
 * A property that renders a tiny colored dot indicating a place to plug a pipe to connect nodes.
 */
export class OutletProperty
    extends LayoutElement<OutletEvents>
    implements IOutlet
{
    private _globalX = 0;
    private _globalY = 0;
    private _isInput = true;
    private _connectedTo: IOutlet | undefined;
    protected _acceptsInputs = true;
    get acceptsInputs() {
        return this._acceptsInputs;
    }

    /**
     * What property of the data we will read we must return? if undefined, the entire data will be returned.
     */
    private _outputProp?: string | (()=>string);

    private _type!: IDataType;

    /**
     * The first type set for this outlet. Useful for when setting it to wildcard because type will be overwritten
     */
    private _defaultType: IDataType;

    /**
     * By default our name will be `nodeName+in/out+outletIndex`
     */
    private _customName?: string;

    /**
     * If this outlet has an error regarding the connection compatibility or something, type the error description.
     */
    error?: string;

    /**
     * returns which prop of the owner's object we will return.
     * @param prop
     * @returns
     */
    outputProp(prop: string | ()=>string) {
        this._outputProp = prop;
        return this;
    }

    get isInput() {
        return this._isInput;
    }
    get globalX() {
        return this._globalX;
    }
    get globalY() {
        return this._globalY;
    }
    get owner() {
        return this.root as Node;
    }
    get onlyOneOutputAllowed() {
        return this.type.size == DataSize.script;
    }

    private _color!: FillStyle;
    get color() {
        return this._color;
    }

    private outletIndex = ++count;

    /**
     * @param isInput If this outlet recieves data or takes data fron the owner and spits that out.
     * @param _myType The type of data we cast the owner data into. If not defined it will use the same data type as the owner.
     */
    constructor(isInput: boolean, type: IDataType) {
        super();

        this._isInput = isInput;

        this._defaultType = type;

        this.type = type;
    }

    get type() {
        return this._type;
    }
    set type(type: IDataType) {
        const changed = type !== this.type;

        if (type == DataType.wildcard) {
            this._defaultType = type;
        }

        if (changed) {
            this._type = type;
            this._color = DataSize2Color[this._type?.size ?? 0];

            this.dispatchEvent({ type: 'typeChange', newType: this._type });
        }
    }

    /**
     * If `other` can be connected to us and the conversion will work....
     */
    isCompatible(other: IOutlet): boolean {
        return this.type.size > DataSize.vec4 || other.type.size > DataSize.vec4
            ? this.type.size == other.type.size
            : true;
    }

    /**
     * `data` is the name of a variable that is in the format defined by `from` to read data from it
     * we must converted to the type of data we expect.
     */
    private convertDataRef(data: string, from: IDataType): string {
        const base = data;
        const to = this.type;

        const sameType =
            !!from.int === !!to.int &&
            !!from.unsigned === !!to.unsigned &&
            !!from.bool === !!to.bool &&
            from.size === to.size &&
            !!from.matrix === !!to.matrix;

        if (sameType) return base;

        const size = to.size;
        const isInt = !!to.int;
        const isUnsigned = !!to.unsigned;
        const isBool = !!to.bool;
        const isMatrix = !!to.matrix;

        if (isMatrix) {
            if (!from.matrix)
                throw new Error(
                    `Outlet ${this.outletName} from node [${this.owner.nodeName}] expects a matrix as input.`,
                );
            if (size === DataSize.vec2) return `${base}.toMat2()`;
            if (size === DataSize.vec3) return `${base}.toMat3()`;
            if (size === DataSize.vec4) return `${base}.toMat4()`;
        }

        if (isBool) {
            if (size === DataSize.vec2) return `${base}.toBVec2()`;
            if (size === DataSize.vec3) return `${base}.toBVec3()`;
            if (size === DataSize.vec4) return `${base}.toBVec4()`;
            return `${base}.toBool()`;
        }

        if (isInt) {
            if (isUnsigned) {
                if (size === DataSize.vec2) return `${base}.toUVec2()`;
                if (size === DataSize.vec3) return `${base}.toUVec3()`;
                if (size === DataSize.vec4) return `${base}.toUVec4()`;
                return `${base}.toUint()`;
            } else {
                if (size === DataSize.vec2) return `${base}.toIVec2()`;
                if (size === DataSize.vec3) return `${base}.toIVec3()`;
                if (size === DataSize.vec4) return `${base}.toIVec4()`;
                return `${base}.toInt()`;
            }
        }

        console.log("NEED TO CONVERT ", from, to)

        if (size === DataSize.vec2) return `${base}.toVec2()`;
        if (size === DataSize.vec3) return `${base}.toVec3()`;
        if (size === DataSize.vec4) return `${base}.toVec4()`;

        return `${base}.toFloat()`;
    }

    get connectedTo() {
        return this._connectedTo;
    }
    set connectedTo(other: IOutlet | undefined) {
        const oldOther = this._connectedTo;
        const changed = oldOther !== other;
        this._connectedTo = other;

        if (changed) {
            if (other) {
                this.onConnected(other);
                this.dispatchEvent({ type: 'connected', to: other });
            } else {
                if (oldOther) {
                    this.onDisconnected(oldOther);
                    this.dispatchEvent({
                        type: 'disconnected',
                        from: oldOther,
                    });
                }
            }
        }
    }

    protected onConnected(to: IOutlet) {}
    protected onDisconnected(from: IOutlet) {}

    override render(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ) {
        const margin = Theme.config.nodeMargin;

        //render circle...
        if (this._acceptsInputs) {
            ctx.save();

            ctx.translate(
                this.isInput ? -margin : maxWidth + margin,
                maxHeight / 2,
            );

            const radius = Theme.config.outletRadius;

            const borderColor = this.error
                ? Theme.config.errorBorderColor
                : Theme.config.borderColor;
            const borderWidth = this.error ? 3 : 1;

            //this.drawPieChartCircle( ctx, 0, 0, radius, DataSize2Color, Theme.config.borderColor, 1)

            if (this.type.size == DataSize.script) {
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.rect(-radius, -radius, radius * 2, radius * 2);
                ctx.fill();

                ctx.strokeStyle = borderColor; //Theme.config.borderColor;
                ctx.lineWidth = borderWidth;
                ctx.stroke();
            } else {
                this.drawCircle(
                    ctx,
                    0,
                    0,
                    radius,
                    this.color,
                    borderColor,
                    borderWidth,
                );
            }

            //
            // obtain the global position of the outlet
            //
            const cursor = this.getGlobalCoordinate(ctx, 0, 0);

            this._globalX = cursor.x;
            this._globalY = cursor.y;

            ctx.restore();
        }

        ctx.translate(this.isInput ? 0 : margin, 0);
        super.render(ctx, maxWidth, maxHeight);
    }

    /**
     * Name of the outlet, to be used when exporting to JS...
     */
    get outletName() {
        return (
            this._customName ??
            this.owner.nodeName +
                '_' +
                (this.isInput ? 'in' : 'out') +
                '_' +
                this.outletIndex
        );
    }
    set outletName(newName: string) {
        const changed = newName != this._customName;
        this._customName = newName;

        if( changed )
        this.dispatchEvent({ type: 'renamed', newName });
    }

    /**
     * We are called from right to left. So the order will always be output first then node then inputs...
     * @param script
     * @returns
     */
    writeScript(script: Script): string {
        this.error = undefined;

        if (this.connectedTo) {
            let otherNameRef: string;

            //
            // if we are an input node, we must ask the other node to write his script
            //
            if (this.isInput) {
                //
                // but the other must be in a reachable scope, else, it is an invalid connection
                //

                try {
                    //
                    // here "connectedTo" is the output outlet of the other node.
                    //
                    otherNameRef = this.connectedTo.writeScript(script);
                    otherNameRef = this.convertDataRef(
                        otherNameRef,
                        this.connectedTo.type,
                    );
                } catch (err) {
                    if (err instanceof Error) {
                        this.error = err.message;
                    } else {
                        //INVALID SCOPE or something...
                        this.error = err as string;
                    }

                    throw err;
                }
            }

            //
            // If we are an output node, we must ask OUR node to write it's script
            //
            else {
                // if the scope of our cached owner is not reachabe from the script current scope, it means it is invalid, non reachable.

                 ///script.getOrCacheNodeScript( this.owner ); // if this throws an error, it will be catche by the input outlet that called us.
                

                if (this._outputProp && typeof this._outputProp == "function") {
                    otherNameRef = this._outputProp(); 
                }
                else 
                {
                    otherNameRef = this.owner.writeScript(script);
                    if (this._outputProp) {
                        otherNameRef += '.' + this._outputProp;
                    }
                }

                if (this.owner.nodeDataType)
                    otherNameRef = this.convertDataRef(
                        otherNameRef,
                        this.owner.nodeDataType,
                    );
            }

            //
            // conver the output of the other node to whatever size we are...
            //
            return otherNameRef;
        } else {
            return '';
        }
    }

    updateType(): void {
        const sourceDataType = this.isInput
            ? this.connectedTo?.type
            : this.owner.nodeDataType;
        const weCopySourceType = this._defaultType == DataType.wildcard;

        if (!weCopySourceType) {
            return;
        }

        if (!sourceDataType) {
            this.type = this._defaultType;
        } else {
            this.type = sourceDataType;
        }

        console.log("OUTLET TYPE:", this.type)

        //
        // since out type changed...
        //
        if (!this.isInput && this.connectedTo) {
            this.connectedTo.updateType();
        }
    }
}
