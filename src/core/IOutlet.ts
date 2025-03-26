import { FillStyle } from "../colors/Theme";
import { Node } from "../nodes/Node"

export type OutletSize = 1|2|3|4|5;

export interface IOutlet {
    isInput:boolean 

    globalX:number
    globalY:number

    connectedTo?:IOutlet
    get owner():Node
    get size():OutletSize; // the output will be vec1 to 4 always... or in case of materials, we can say 5.
    get color():FillStyle

    isCompatible( other:IOutlet ):boolean
}