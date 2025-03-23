import { WinIntProperty } from "../properties/WinIntProperty";
import { WinNode } from "./WinNode";
import { WinOutputProperty } from "../properties/WinOutputProperty";
import { Theme } from "../colors/Theme";

export class UVWindow extends WinNode {
    constructor() {
        super("UV Map")
        this.headerColor = Theme.color.groupInput;

        this.childs = [
                    new WinOutputProperty("UV"), 
                    new WinIntProperty("Index", 0, 5), 
                ]
    }
}