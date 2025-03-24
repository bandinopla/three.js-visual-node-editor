import { FillStyle } from "../colors/Theme";
import { LayoutElement } from "../layout/LayoutElement";

export class NodeTitle extends LayoutElement {
    constructor( protected title:string, protected bgColor:FillStyle )
    {
        super()
    }

    override height(ctx: CanvasRenderingContext2D): number {  
        return this.fontSize + 10 ;
    }
    
}