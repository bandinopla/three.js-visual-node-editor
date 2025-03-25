import { Theme } from "../colors/Theme";
import { DraggableValue } from "../components/DraggableValue";
import { Layout } from "../layout/Layout";
import { Input } from "./Input";

export class UVChannelProperty extends Input
{
    constructor() {
        super( Theme.config.vec1 )
        this.singleLine = true;

        this.layout = new Layout("column","space-around","stretch",[
            new DraggableValue("UV Channel", false, 0, 5, 1)
        ]);
    }


}