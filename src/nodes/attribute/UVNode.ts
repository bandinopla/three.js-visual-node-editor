 
import { DraggableValue } from "../../components/DraggableValue";
import { Script } from "../../export/Script";
import { UVAttributeProperty } from "../../properties/UVAttributeProperty"; 
import { AttributeTypeNode } from "./AttributeTypeNode";

export class UVNode extends AttributeTypeNode {
 
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
}