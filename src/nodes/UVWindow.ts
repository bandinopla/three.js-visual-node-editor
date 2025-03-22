import { WinIntProperty } from "./WinIntProperty";
import { WinNode } from "./WinNode";
import { WinOutputProperty } from "./WinOutputProperty";

export class UVWindow extends WinNode {
    constructor() {
        super("UV Map")
        this.headerColor = "#83314a"

        this.childs = [
                    new WinOutputProperty("UV"), 
                    new WinIntProperty("Index", 0, 10), 
                ]
    }
}