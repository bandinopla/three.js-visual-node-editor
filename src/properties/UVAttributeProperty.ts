import { Theme } from "../colors/Theme";
import { Output } from "./Output";

export class UVAttributeProperty extends Output {
    constructor() { 
        super("UV", Theme.config.vec2);
    }
}