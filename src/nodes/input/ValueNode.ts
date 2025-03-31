import { DraggableNumber } from "../../components/DraggableNumber";
import { DraggableValue } from "../../components/DraggableValue";
import { Output } from "../../properties/Output";
import { InputBaseNode } from "./InputBaseNode";

export class ValueNode extends InputBaseNode {
    constructor() {

        super("Value", [
            new Output("Value", 1),
            new DraggableNumber()
        ]);
    }
}