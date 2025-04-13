 
 
import { Theme } from "../../colors/Theme";
import { DataType } from "../../core/IOutlet";
import { Script } from "../../export/Script";
import { Output } from "../../properties/Output";
import { ExecutableLogicNode } from "../logic/ExecutableLogicNode";
import { WinNode } from "../WinNode";

 

/**
 * Use this as skeleton for a new node...
 */
export class AnimatedPixelNode extends WinNode {

    protected scriptOutput:Output;

    constructor() {
        super("Animated Pixel", Theme.config.groupAnimation, [
            new Output("color ( VAR )", DataType.vec3, "color" ), 
            new Output("on update", DataType.script),
            new Output("final color", DataType.vec3, "output" ),
        ]);

        this.scriptOutput = this.getChildOfType(Output,1)!;
    }  

    protected override writeNodeScript( script: Script ): string {
        // this is where we write our ThreeJs TSL javascript node code...
        script.importModule("color");
         
        const colorVar = script.define( this.nodeName+"Var", "color(0,0,0).toVar()");
 
        const scope = script.newScope(false); 
 
        ( this.scriptOutput.connectedTo?.owner as ExecutableLogicNode )?.writeBlockScript(script); 

        scope.exit();

        const fn = script.defineFunction(
            scope,
            this.nodeName+"Fn",
            false, 
        );

        return script.define( this.nodeName, `{ color:${colorVar}, output:${fn} }`);
    } 
}