import { Theme } from "../../colors/Theme";
import { LayoutElement } from "../../layout/LayoutElement";
import { WinNode } from "../WinNode";

/**
 * Base class to every node in this category
 */
export class AttributeTypeNode extends WinNode {
    constructor( childs:LayoutElement[]) {
        super( "Attribute", Theme.config.groupAttribute, childs ); 
    }
 
}