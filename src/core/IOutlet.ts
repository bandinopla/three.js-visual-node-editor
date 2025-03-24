import { Node } from "../nodes/Node"

export interface IOutlet {
    isInput:boolean 

    globalX:number
    globalY:number

    connectedTo?:IOutlet
    get owner():Node
}