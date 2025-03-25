 
import { UVAttributeProperty } from "../../properties/UVAttributeProperty";
import { AttributeTypeNode } from "./AttributeTypeNode";

export class UVNode extends AttributeTypeNode {
    constructor() {
        super([
            new UVAttributeProperty()
        ]); 
    }
}