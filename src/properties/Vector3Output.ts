import { Theme } from "../colors/Theme";
import { Output } from "./Output";

export class Vector3Output extends Output {
    constructor( name:string ) {
        super(name, 3);
    } 
}