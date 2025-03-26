import { TextLabel } from "../components/TextLabel";
import { Row } from "../layout/Layout";
import { Input } from "./Input";

export class MaterialProperty extends Input {
    constructor( name:string ) {
        super(5); 

        this.layout = new Row([
            new TextLabel( name ),  
        ] ); 
        this.xPadding = 10
    } 
}