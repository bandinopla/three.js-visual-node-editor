import { Theme } from "../colors/Theme";
import { DraggableValue } from "../components/DraggableValue";
import { Layout } from "../layout/Layout";
import { Input } from "./Input";

export class UVChannelProperty extends Input
{
    constructor() {
        super( 1 ) 
 
        //"column","space-around","stretch",
        this.layout = new Layout([
            new DraggableValue("UV Channel", false, 0, 5, 1)
        ], {
            direction:"column",
            justify:"space-around",
            align:"stretch"
        });
    }


}