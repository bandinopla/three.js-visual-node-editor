import { Theme } from "../../colors/Theme";
import { Output } from "../../properties/Output";
import { WinNode } from "../WinNode";

export class FunctionNode extends WinNode {
    constructor() {
        super("Function", Theme.config.groupLogic,[
            new Output( "return", 0)
        ] );
        this._canHaveChilds = true;
    }
}