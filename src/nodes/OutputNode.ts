import { WinNode } from "./WinNode";
import { WinProperty } from "../properties/WinProperty";
import { Theme } from "../colors/Theme";

export class OutputNode extends WinNode {
    constructor() {
        super("Output");
        this.headerColor = Theme.color.groupOutput;

        this.childs = [
            new WinProperty("Color"),
        ]
    }
}