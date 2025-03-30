import { OutletSize } from "../core/IOutlet";
import { Script } from "../export/Script";
import { Input } from "./Input";

/**
 * Just an input with a label.
 */
export class BasicInputProperty extends Input {

    /** 
     * @param size 
     * @param label 
     * @param defaultScriptIfNotConnected If not connected, what should this input add to the script?
     */
    constructor( size:OutletSize, protected label:string, protected defaultScriptIfNotConnected?:(script:Script)=>string ) {
        super(size);
    }

    override renderContents(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void {
        this.writeText(ctx, this.label, this.fontSize, 0, maxHeight, this.fontColor);
    }

    override writeScript(script: Script): string { 
        return !this.connectedTo? this.defaultScriptIfNotConnected?.(script) ?? "" :super.writeScript(script);
    }
}