import { Theme } from "../colors/Theme";
import { DraggableValue } from "../components/DraggableValue";
import { Layout } from "../layout/Layout";
import { Input } from "./Input";

export class UVChannelProperty extends Input
{
    private slider:DraggableValue;

    constructor() {
        super( 1 ) 
 
        this.slider = new DraggableValue("UV Channel", false, 0, 5, 1, ()=>this.node.update());

        //"column","space-around","stretch",
        this.layout = new Layout([
            this.slider 
        ], {
            direction:"column",
            justify:"space-around",
            align:"stretch"
        });
    }


}