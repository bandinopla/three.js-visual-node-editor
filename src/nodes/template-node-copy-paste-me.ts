import { Theme } from "../colors/Theme";
import { IDataType } from "../core/IOutlet";
import { Script } from "../export/Script";
import { WinNode } from "./WinNode";

/**
 * Use this as skeleton for a new node...
 */
export class FooNode extends WinNode {

    constructor() {
        super("title...", Theme.config.groupXXXXX, [
            // place UI ListElements here....
        ])
    }

    override get nodeDataType(): IDataType | undefined {
        // what data type this node will define when writeScript is called
    }

    protected override writeNodeScript(_script: Script): string {
        // this is where we write our ThreeJs TSL javascript node code...
    }

    override serialize(): Record<string, any> {
        return {
            foo: true,
            ...super.serialize()
        }
    }

    override unserialize(data: Record<string, any>): void { 
        super.unserialize(data);
        this.foo = data.foo;
    }
}