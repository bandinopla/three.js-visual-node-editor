import { WinIntProperty } from "../properties/WinIntProperty";
import { WinNode } from "./WinNode";
import { WinOutputProperty } from "../properties/WinOutputProperty";

export class UVWindow extends WinNode {
    constructor() {
        super("UV Map")
        this.headerColor = "#83314a"

        this.childs = [
                    new WinOutputProperty("UV"), 
                    new WinIntProperty("Index", 0, 5), 
                ]
    }
}