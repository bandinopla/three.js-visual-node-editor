import { IDataType } from '../core/IOutlet';
import { Script } from '../export/Script';
import { Input } from './Input';

/**
 * Just an input with a label.
 */
export class BasicInputProperty extends Input {

    protected _label:string;
    set label(str:string){ this._label=str; }
    get label(){ return this._label; }

    /**
     * @param size
     * @param label
     * @param defaultScriptIfNotConnected If not connected, what should this input add to the script?
     */
    constructor(
        type: IDataType,
        label: string,
        protected defaultScriptIfNotConnected?: (script: Script) => string,
    ) {
        super(type);
        this._label = label;
    }

    override renderContents(
        ctx: CanvasRenderingContext2D,
        maxWidth: number,
        maxHeight: number,
    ): void {
        if (this.layout) return super.renderContents(ctx, maxWidth, maxHeight);
        this.writeText(
            ctx,
            this.label,
            this.fontSize,
            0,
            maxHeight,
            this.fontColor,
        );
    }

    override writeScript(script: Script): string {
        if (!this.connectedTo) {
            if (this.defaultScriptIfNotConnected) {
                return this.defaultScriptIfNotConnected(script);
            }

            this.error = `Input property [${this.outletName}] from node [${this.owner.nodeName}]${this.owner.childOf ? ` inside of node [${this.owner.childOf.nodeName}]` : ''} was not provided.`;
            throw new Error(this.error);
        }

        return super.writeScript(script);
    }
}
