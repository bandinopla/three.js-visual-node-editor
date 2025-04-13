 
import { Theme } from "../../colors/Theme";
import { DataType, IDataType } from "../../core/IOutlet";
import { Script } from "../../export/Script";
import { Output } from "../../properties/Output";
import { WinNode } from "../WinNode";

 

/**
 * Use this as skeleton for a new node...
 */
export class TimeNode extends WinNode {

    constructor() {
        super("Timer", Theme.config.groupAnimation, [
            new Output("seconds", DataType.wildcard),
        ])
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return super.width(ctx)/2;
    }

    override get nodeDataType(): IDataType | undefined {
        return DataType.uint;
    }

    protected override writeNodeScript( script: Script ): string {
        // this is where we write our ThreeJs TSL javascript node code...

        const ref = script.defineUniform(
            this.nodeName,
            '0',
        ); 
  
        script.importModule("uint");
        script.writeLine(`${ref}.onFrameUpdate( frame => ${ref}.value = frame.time )`); 

        return ref;
    } 
}