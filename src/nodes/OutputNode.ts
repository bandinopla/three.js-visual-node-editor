import { WinNode } from "./WinNode";
import { WinProperty } from "./WinProperty";

export class OutputNode extends WinNode {
    constructor() {
        super("Output");
        this.headerColor = "#3c1d26";

        this.childs = [
            new WinProperty("Color"),
        ]
    }
}