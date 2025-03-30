 
import { DraggableValue } from "../../components/DraggableValue";
import { Script } from "../../export/Script";
import { UVAttributeProperty } from "../../properties/UVAttributeProperty"; 
import { BaseAttributeNode } from "./BaseAttributeNode";

export class UVNode extends BaseAttributeNode {
 
    private uvChannel:DraggableValue;

    constructor() { 

        const uvChannel = new DraggableValue("UV Channel", false, 0, 5, 1, ()=>this.update())

        super([
            new UVAttributeProperty(),
            uvChannel,
        ]); 

        this.uvChannel = uvChannel; 
    }

    override writeScript(script: Script): string {
         
        const uvChannel = this.uvChannel.stringValue;

        script.importModule("uv");

        return script.define(this.nodeName, `uv(${uvChannel})`);

    }

    override serialize(): Record<string, any> {
        const out = super.serialize();

        out.channel = this.uvChannel.value;

        return out;
    }

    override unserialize(data: Record<string, any>): void {
        this.uvChannel.value = data.channel;
        super.unserialize( data );
    }
}