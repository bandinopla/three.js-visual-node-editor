import { Theme } from "../../colors/Theme";
import { LayoutElement } from "../../layout/LayoutElement";
import { WinNode } from "../WinNode";

export class AttributeTypeNode extends WinNode {
    constructor( childs:LayoutElement[]) {
        super( "Attribute", Theme.config.groupAttribute, childs ); 
    }

    override width(ctx: CanvasRenderingContext2D): number {
        return 100
    }
}