 
import { UVAttributeProperty } from "../../properties/UVAttributeProperty";
import { UVChannelProperty } from "../../properties/UVChannelProperty";
import { AttributeTypeNode } from "./AttributeTypeNode";

export class UVNode extends AttributeTypeNode {
    constructor() {
        super([
            new UVAttributeProperty(),
            new UVChannelProperty(),
        ]); 
    }
}